-- ============================================================
-- 食材価格くらべ：初期「参考価格」データ
--
-- ▼ 目的
--   公開サイトで「食材がまだ登録されていません。」と出ないように、
--   主要な食材の「参考価格（概算）」を登録する。
--   ※これは店舗別の実売価格（prices テーブル）とは別物です。
--     店舗・地域・時期で変動するため、あくまで「参考価格」として扱います。
--
-- ▼ 実行場所
--   Supabase 管理画面 →「SQL Editor」→「New query」→ 貼り付け →「Run」
--   何度実行しても重複しません（item_name に一意制約＋UPSERT）。
--
-- ▼ 既存テーブルへの影響
--   stores / prices / storage は一切変更しません。新規テーブルの追加のみです。
--
-- ▼ price_status の意味
--   confirmed   … 公的統計（総務省 小売物価統計調査 など）の数値そのもの／単純な単位換算
--   estimated   … 統計の近い品目や民間調査から妥当と判断した概算
--   needs_review … 十分な根拠が集まらなかった。アプリでは「価格確認中」と表示する
--
-- ▼ 地域（region）
--   今回登録した価格に京都市単独のデータはありません。すべて「全国」平均です。
--   「全国平均を京都の価格として見せない」ため、region を必ず表示します。
-- ============================================================


-- 1. テーブル作成 -------------------------------------------
create table if not exists public.reference_prices (
  id              bigint generated always as identity primary key,
  item_name       text not null unique,          -- 食材名（1食材1行）
  category        text not null,                 -- 分類（肉類 / 野菜 など）
  unit            text not null,                 -- 表示単位（"10個入り1パック" など）
  reference_price integer,                       -- 参考価格（円）。needs_review のときは null
  price_status    text not null default 'needs_review'
                    check (price_status in ('confirmed', 'estimated', 'needs_review')),
  region          text,                          -- "全国" / "近畿" / "京都市" など。不明は null
  survey_date     text,                          -- "2026年7月" など（幅のある時期表現）
  source_name     text,                          -- 情報源の名前
  source_url      text,                          -- 出典URL
  source_price    text,                          -- 元の価格（単位込みの文字列）
  source_unit     text,                          -- 元の単位
  conversion_note text,                          -- 単位換算した場合の計算方法
  note            text,                          -- 備考
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- confirmed / estimated なら価格が入っていること
  constraint reference_prices_price_required
    check (price_status = 'needs_review' or reference_price is not null)
);


-- 2. 行レベルセキュリティ（閲覧は誰でも可・書き込みは SQL Editor からのみ）---
alter table public.reference_prices enable row level security;

drop policy if exists "reference_prices_public_read" on public.reference_prices;
create policy "reference_prices_public_read"
  on public.reference_prices for select
  using (true);


-- 3. 初期データ（UPSERT：再実行しても重複しない）---------------
insert into public.reference_prices
  (item_name, category, unit, reference_price, price_status,
   region, survey_date, source_name, source_url, source_price, source_unit,
   conversion_note, note)
values
  -- ===== 米・パン・麺類 =====
  ('米（5kg）', '米・パン・麺類', '5kg 1袋', 4150, 'confirmed',
   '全国', '2026年7月', '総務省 小売物価統計調査（「日本の物価」集計）',
   'https://www.jpmarket-conditions.com/1002/', '4,154円 / 5kg', '5kg 1袋',
   '端数を丸めて4,150円',
   '単一原料米（コシヒカリを除く）の全国平均。ブランド米は5,000円前後'),

  ('食パン', '米・パン・麺類', '1斤（6枚切り・約340g）', 180, 'confirmed',
   '全国', '2026年5月', '総務省 小売物価統計調査（「日本の物価」集計）',
   'https://www.jpmarket-conditions.com/1021/', '約519円 / 1kg', '1kg',
   '1kg単価519円 × 0.34kg（1斤=約340g）≒ 176円 → 約180円に丸め',
   '銘柄・枚数（4枚/5枚/6枚/8枚切り）で変動'),

  ('うどん', '米・パン・麺類', '1袋（ゆで・約200g）', null, 'needs_review',
   null, null, null, null, null, null,
   null, '公的価格を取得できず。要確認'),

  ('スパゲッティ', '米・パン・麺類', '500g 1袋', null, 'needs_review',
   null, null, null, null, null, null,
   null, '公的価格を取得できず。要確認'),

  -- ===== 卵・乳製品 =====
  ('卵', '卵・乳製品', '10個入り1パック', 316, 'confirmed',
   '全国', '2026年7月', '総務省 小売物価統計調査（「日本の物価」集計）',
   'https://www.jpmarket-conditions.com/1341/', '316円 / 10個入りパック', '10個入りパック',
   'なし', '白色卵・Lサイズの全国平均'),

  ('牛乳', '卵・乳製品', '1L（1000ml）1本', 266, 'confirmed',
   '全国', '2026年6月', '総務省 小売物価統計調査（「ねだんチャート」集計）',
   'https://nedan-chart.com/items/milk/', '266円 / 1000ml', '1000ml 1本',
   'なし', '2026年後半にメーカー各社の値上げあり'),

  -- ===== 肉類 =====
  ('鶏むね肉', '肉類', '100gあたり', 100, 'estimated',
   '全国', '2026年', '楽天のグラム単価まとめ（Ribbit''s works・二次情報）',
   'https://ribbit.konomi.app/price/tori-mune/', '約100円 / 100g', '100g',
   'なし', '公的統計は「鶏肉」のみ。むね肉単独の公的価格は未取得'),

  ('鶏もも肉', '肉類', '100gあたり', 159, 'estimated',
   '全国', '2026年6月', '総務省 小売物価統計調査「鶏肉（ブロイラー）」（「日本の物価」集計）',
   'https://www.jpmarket-conditions.com/1221/', '159円 / 100g', '100g',
   'なし', '統計の「鶏肉」はもも肉中心。むね肉はこれより安い傾向'),

  ('豚こま肉', '肉類', '100gあたり', null, 'needs_review',
   '全国', '2026年7月', '総務省 小売物価統計調査「豚肉（ばら）」（「日本の物価」集計）',
   'https://www.jpmarket-conditions.com/1211/', '303円 / 100g（※ばら肉）', '100g',
   null, 'こま切れ肉の公的価格は未取得。参考：豚ばら肉は100g 303円'),

  ('牛こま肉', '肉類', '100gあたり', null, 'needs_review',
   null, null, null, null, null, null,
   null, '公的価格を取得できず。要確認'),

  ('ひき肉', '肉類', '100gあたり', null, 'needs_review',
   null, null, null, null, null, null,
   null, '公的価格を取得できず。要確認（合いびき・豚・鶏で差がある）'),

  -- ===== 野菜 =====
  ('キャベツ', '野菜', '1玉（約800g）', null, 'needs_review',
   null, null, '農畜産業振興機構「ベジ探」野菜小売価格動向調査',
   'https://vegetan.alic.go.jp/retail-price-trends/price-trend-survey.html', null, null,
   null, '数値は月別PDFのみで未取得。2026年7月から基準単位が約800g/玉に変更'),

  ('白菜', '野菜', '1/4玉', null, 'needs_review',
   null, null, '農畜産業振興機構「ベジ探」野菜小売価格動向調査',
   'https://vegetan.alic.go.jp/retail-price-trends/price-trend-survey.html', null, null,
   null, '数値未取得。要確認'),

  ('玉ねぎ', '野菜', '1個', null, 'needs_review',
   null, null, '農林水産省「食品価格動向調査（野菜）」',
   'https://www.maff.go.jp/j/zyukyu/anpo/kouri/', null, null,
   null, '2025年夏の不作で高値傾向との情報のみ。具体的価格は未取得'),

  ('じゃがいも', '野菜', '1個', null, 'needs_review',
   null, null, '農林水産省「食品価格動向調査（野菜）」',
   'https://www.maff.go.jp/j/zyukyu/anpo/kouri/', null, null,
   null, '2025年夏の不作で高値傾向との情報のみ。具体的価格は未取得'),

  ('にんじん', '野菜', '1本', null, 'needs_review',
   null, null, '農畜産業振興機構「ベジ探」野菜小売価格動向調査',
   'https://vegetan.alic.go.jp/retail-price-trends/price-trend-survey.html', null, null,
   null, '数値未取得。要確認'),

  ('もやし', '野菜', '1袋（約200g）', null, 'needs_review',
   null, null, null, null, null, null,
   null, '公的価格を取得できず。要確認（一般に30〜40円と安価）'),

  ('トマト', '野菜', '1個', null, 'needs_review',
   null, null, '農畜産業振興機構「ベジ探」野菜小売価格動向調査',
   'https://vegetan.alic.go.jp/retail-price-trends/price-trend-survey.html', null, null,
   null, '数値未取得。要確認'),

  ('きゅうり', '野菜', '1本', null, 'needs_review',
   null, null, '農畜産業振興機構「ベジ探」野菜小売価格動向調査',
   'https://vegetan.alic.go.jp/retail-price-trends/price-trend-survey.html', null, null,
   null, '数値未取得。要確認'),

  ('長ねぎ', '野菜', '1本', null, 'needs_review',
   null, null, '農畜産業振興機構「ベジ探」野菜小売価格動向調査',
   'https://vegetan.alic.go.jp/retail-price-trends/price-trend-survey.html', null, null,
   null, '数値未取得。要確認'),

  -- ===== 果物 =====
  ('バナナ', '果物', '1房', null, 'needs_review',
   null, null, null, null, null, null,
   null, '公的価格を取得できず。要確認'),

  ('りんご', '果物', '1個', null, 'needs_review',
   '全国', '2021年10月', '総務省 小売物価統計調査「りんご（つがる）」（「日本の物価」集計）',
   'https://www.jpmarket-conditions.com/1501/', '590円 / 1kg', '1kg',
   null, '直近データが2021年のため参考価格として不採用。要確認'),

  -- ===== 大豆製品 =====
  ('豆腐', '大豆製品', '1丁（約300g）', null, 'needs_review',
   null, null, null, null, null, null,
   null, '公的価格を取得できず。要確認'),

  ('納豆', '大豆製品', '3パック 1セット', 105, 'estimated',
   '全国', '2025年', 'E-Housing「日本の食費はいくら？」記事（二次情報）',
   'https://e-housing.jp/ja/post/how-much-does-food-really-cost-jp', '約100〜110円 / 3パック', '3パック 1セット',
   '100〜110円の中央値 105円', '公的統計は未取得。二次情報のため estimated'),

  -- ===== 調味料・その他 =====
  ('食用油', '調味料・その他', '1L（約1000g）1本', 400, 'confirmed',
   '全国', '2026年2月', '総務省 小売物価統計調査（「日本の物価」集計）',
   'https://www.jpmarket-conditions.com/1601/', '401円 / 1本（約1000g）', '1本（約1000g）',
   '1本（約1000g）を1Lとみなし、端数を丸めて400円', 'キャノーラ油等のペットボトル入り'),

  ('しょうゆ', '調味料・その他', '1L 1本', null, 'needs_review',
   null, null, null, null, null, null,
   null, '公的価格を取得できず。要確認'),

  ('砂糖', '調味料・その他', '1kg 1袋', null, 'needs_review',
   null, null, null, null, null, null,
   null, '公的価格を取得できず。要確認（上白糖）'),

  ('塩', '調味料・その他', '1kg 1袋', null, 'needs_review',
   null, null, null, null, null, null,
   null, '公的価格を取得できず。要確認'),

  ('カレールー', '調味料・その他', '1箱（約140g）', null, 'needs_review',
   null, null, 'おとくらし「2026年8月から値上げするもの」',
   'https://otokurashi.jp/price-hike-august-2026/', null, null,
   null, '2026年8月に値上げ情報あり。具体的価格は未取得。要確認')

on conflict (item_name) do update set
  category        = excluded.category,
  unit            = excluded.unit,
  reference_price = excluded.reference_price,
  price_status    = excluded.price_status,
  region          = excluded.region,
  survey_date     = excluded.survey_date,
  source_name     = excluded.source_name,
  source_url      = excluded.source_url,
  source_price    = excluded.source_price,
  source_unit     = excluded.source_unit,
  conversion_note = excluded.conversion_note,
  note            = excluded.note,
  updated_at      = now();
