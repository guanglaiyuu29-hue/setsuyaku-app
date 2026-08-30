-- ============================================================
-- 食材価格くらべ：データベースの設計図（テーブル作成SQL）
--
-- ▼ 実行場所
--   Supabase 管理画面 → 左メニュー「SQL Editor」→ 右上「New query」
--   → このファイルの中身を全部コピーして貼り付け
--   → 右下の「Run」ボタン（またはキーボードで Ctrl+Enter）
--
--   1回だけ実行すればOKです。
--   （もう一度流しても壊れないよう "if not exists" を付けています）
-- ============================================================


-- 店舗テーブル ------------------------------------------------
create table if not exists public.stores (
  id           text primary key,   -- 店舗ID（"aeon-demachiyanagi" のような英字の合言葉）
  name         text not null,      -- 店舗名（画面に出る名前）
  walk_minutes integer not null,   -- 徒歩の所要時間（分）
  bike_minutes integer not null,   -- 自転車の所要時間（分）
  note         text                -- 補足メモ（無くてもよい ＝ null 可）
);


-- 価格テーブル ----------------------------------------------
-- 1行 ＝「ある店の・ある食材の・ある日の値段」。
-- 【重要】古い価格も消さずに、すべて履歴としてここに積み上げます。
create table if not exists public.prices (
  id          bigint generated always as identity primary key,  -- 1行ごとの通し番号（自動で振られる）
  item_name   text not null,                                    -- 食材名（"卵" など）
  store_id    text not null references public.stores(id),       -- どの店か（stores.id とつながる）
  price       integer not null,                                 -- 税込価格（円。数字のみ）
  unit        text not null,                                    -- 単位・内容量（"10個入り1パック" など）
  checked_at  date not null,                                    -- 価格を確認した日
  source      text not null default 'official'
                constraint prices_source_check
                check (source in ('official', 'receipt', 'sample')), -- official=運営調査 / receipt=レシート投稿 / sample=動作確認用の仮データ
  created_at         timestamptz not null default now(),               -- この行が登録された日時（自動）
  user_id            uuid references auth.users(id) on delete set null, -- 投稿者。運営データは null
  receipt_image_path text                                                -- レシート画像の保存先（Storage内のパス）。運営データは null
);


-- 索引（インデックス）----------------------------------------
-- よく検索する列に付けておくと、データが増えても表示が速いままです。
create index if not exists prices_item_name_idx
  on public.prices (item_name);
create index if not exists prices_store_item_idx
  on public.prices (store_id, item_name, checked_at desc);


-- 行レベルセキュリティ（RLS）--------------------------------
-- anon キーはアプリに埋め込まれてブラウザに配られる（＝誰でも手に入る）ので、
-- 「誰が何をできるか」をDB側で決めておく必要があります。
-- ここでは「閲覧は誰でもOK / 書き込みは今は禁止」に設定します。
-- （レシート投稿機能を作るときに、投稿用のルールを追加します）
alter table public.stores enable row level security;
alter table public.prices enable row level security;

drop policy if exists "stores_public_read" on public.stores;
create policy "stores_public_read"
  on public.stores for select
  using (true);

drop policy if exists "prices_public_read" on public.prices;
create policy "prices_public_read"
  on public.prices for select
  using (true);

-- レシート投稿：ログイン済みユーザーは「自分の receipt データ」だけ追加できる
-- （運営調査データ source='official' は SQL Editor から入れるので、ここでは禁止のまま）
drop policy if exists "prices_insert_receipt" on public.prices;
create policy "prices_insert_receipt"
  on public.prices for insert to authenticated
  with check (
    source = 'receipt'
    and user_id = auth.uid()
  );


-- レシート画像の保存場所（Storage バケット）------------------
-- 非公開バケット。10MBまで。画像ファイルのみ許可。
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts', 'receipts', false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

-- アップロード：ログイン済みユーザーは「自分のID名のフォルダ」にだけ入れられる
drop policy if exists "receipts_insert_own" on storage.objects;
create policy "receipts_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 閲覧：自分がアップロードした画像だけ見られる
drop policy if exists "receipts_read_own" on storage.objects;
create policy "receipts_read_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
