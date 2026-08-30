-- ============================================================
-- 食材価格くらべ：比較機能の動作確認用「サンプル店舗＋店舗別価格」
--
-- ▼ 目的
--   店舗別の価格くらべ画面を動かすための仮データ。
--   ※ 実測ではありません。source = 'sample' で登録し、
--     アプリ画面では「サンプルデータ」と明示されます。
--
-- ▼ 実行場所
--   Supabase 管理画面 →「SQL Editor」→「New query」→ 貼り付け →「Run」
--   先に schema.sql（stores / prices テーブル作成）を実行済みであること。
--   何度実行しても重複しません（store は UPSERT、price は sample 行が無いときだけ投入）。
--
-- ▼ 価格の作り方
--   initial_food_prices.sql の参考価格（全国平均）を基準に、
--   店舗の業態に応じて ±10〜25% 程度ばらつかせた仮の値です。
--   checked_at は実行日（current_date）。
-- ============================================================


-- 0. source 列に 'sample' を許可する ------------------------
--    既存の CHECK 制約（official / receipt のみ）を張り替えます。
do $$
declare
  r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.prices'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%source%'
  loop
    execute format('alter table public.prices drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.prices
  add constraint prices_source_check
  check (source in ('official', 'receipt', 'sample'));


-- 1. サンプル店舗（4件）-----------------------------------
insert into public.stores (id, name, walk_minutes, bike_minutes, note) values
  ('sandy-shimogamo',      'サンディ 下鴨店',     25, 8, 'ディスカウントスーパー。価格重視、品ぞろえは日により変動'),
  ('aeon-kitaoji',         'イオン 北大路店',     12, 4, '大型総合スーパー。品ぞろえが豊富'),
  ('life-matsubara',       'ライフ 松原店',       18, 6, '品質重視。夕方以降は総菜が値引き'),
  ('sugi-demachiyanagi',   'スギ薬局 出町柳店',    8, 3, 'ドラッグストア。食品は日用品のついで買い向き')
on conflict (id) do update set
  name         = excluded.name,
  walk_minutes = excluded.walk_minutes,
  bike_minutes = excluded.bike_minutes,
  note         = excluded.note;


-- 2. サンプル店舗別価格（8品目 × 4店舗 = 32件）-------------
--    「まだ sample 価格が1件も無いとき」だけ投入します。
insert into public.prices (item_name, store_id, price, unit, checked_at, source)
select v.item_name, v.store_id, v.price, v.unit, current_date, 'sample'
from (values
  -- item_name       store_id               price   unit
  -- 米（5kg）  基準 約4,150円
  ('米（5kg）',   'sandy-shimogamo',    3280, '5kg 1袋'),
  ('米（5kg）',   'aeon-kitaoji',       3980, '5kg 1袋'),
  ('米（5kg）',   'life-matsubara',     4480, '5kg 1袋'),
  ('米（5kg）',   'sugi-demachiyanagi', 4280, '5kg 1袋'),

  -- 食パン  基準 約180円
  ('食パン',      'sandy-shimogamo',     138, '1斤（6枚切り）'),
  ('食パン',      'aeon-kitaoji',        168, '1斤（6枚切り）'),
  ('食パン',      'life-matsubara',      208, '1斤（6枚切り）'),
  ('食パン',      'sugi-demachiyanagi',  188, '1斤（6枚切り）'),

  -- 卵  基準 約316円
  ('卵',          'sandy-shimogamo',     258, '10個入り1パック'),
  ('卵',          'aeon-kitaoji',        288, '10個入り1パック'),
  ('卵',          'life-matsubara',      338, '10個入り1パック'),
  ('卵',          'sugi-demachiyanagi',  278, '10個入り1パック'),

  -- 牛乳  基準 約266円
  ('牛乳',        'sandy-shimogamo',     225, '1L（1000ml）'),
  ('牛乳',        'aeon-kitaoji',        248, '1L（1000ml）'),
  ('牛乳',        'life-matsubara',      288, '1L（1000ml）'),
  ('牛乳',        'sugi-demachiyanagi',  238, '1L（1000ml）'),

  -- 鶏もも肉  基準 約159円 / 100g
  ('鶏もも肉',    'sandy-shimogamo',     128, '100gあたり'),
  ('鶏もも肉',    'aeon-kitaoji',        148, '100gあたり'),
  ('鶏もも肉',    'life-matsubara',      178, '100gあたり'),
  ('鶏もも肉',    'sugi-demachiyanagi',  168, '100gあたり'),

  -- 鶏むね肉  基準 約100円 / 100g
  ('鶏むね肉',    'sandy-shimogamo',      78, '100gあたり'),
  ('鶏むね肉',    'aeon-kitaoji',         92, '100gあたり'),
  ('鶏むね肉',    'life-matsubara',      118, '100gあたり'),
  ('鶏むね肉',    'sugi-demachiyanagi',  108, '100gあたり'),

  -- 納豆  基準 約105円 / 3パック
  ('納豆',        'sandy-shimogamo',      85, '3パック 1セット'),
  ('納豆',        'aeon-kitaoji',         95, '3パック 1セット'),
  ('納豆',        'life-matsubara',      118, '3パック 1セット'),
  ('納豆',        'sugi-demachiyanagi',   98, '3パック 1セット'),

  -- 豆腐  参考価格が未確定のため、一般的な相場 約70円 / 1丁 を基準にした仮値
  ('豆腐',        'sandy-shimogamo',      55, '1丁（約300g）'),
  ('豆腐',        'aeon-kitaoji',         65, '1丁（約300g）'),
  ('豆腐',        'life-matsubara',       82, '1丁（約300g）'),
  ('豆腐',        'sugi-demachiyanagi',   68, '1丁（約300g）')
) as v(item_name, store_id, price, unit)
where not exists (select 1 from public.prices where source = 'sample');
