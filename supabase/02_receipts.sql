-- ============================================================
-- 食材価格くらべ：レシート投稿機能ぶんの「追加」SQL
--
-- ▼ 誰が実行する？
--   すでに schema.sql / seed.sql を実行済みの人が、
--   その差分だけを反映するためのファイルです。
--   （これから schema.sql を新規に流す人は不要。最新の schema.sql に取り込み済み）
--
-- ▼ 実行場所
--   Supabase 管理画面 → 「SQL Editor」→「New query」→ 貼り付け →「Run」
--   何度流しても大丈夫なように書いています。
-- ============================================================


-- 1. prices に「レシート画像の保存先パス」列を追加 -----------
alter table public.prices
  add column if not exists receipt_image_path text;


-- 2. ログイン済みユーザーが「自分の receipt データ」を追加できるようにする ---
drop policy if exists "prices_insert_receipt" on public.prices;
create policy "prices_insert_receipt"
  on public.prices for insert to authenticated
  with check (
    source = 'receipt'
    and user_id = auth.uid()
  );


-- 3. レシート画像を入れる保存場所（Storage バケット）を作る ---
-- 非公開・10MBまで・画像ファイルのみ許可。
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts', 'receipts', false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;


-- 4. Storage の権限 ----------------------------------------
-- アップロード：自分のID名のフォルダにだけ入れられる
drop policy if exists "receipts_insert_own" on storage.objects;
create policy "receipts_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 閲覧：自分がアップロードした画像だけ
drop policy if exists "receipts_read_own" on storage.objects;
create policy "receipts_read_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
