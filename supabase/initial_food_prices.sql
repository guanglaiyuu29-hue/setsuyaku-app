create table if not exists public.reference_prices (
  id bigint generated always as identity primary key,
  item_name text not null,
  category text not null,
  unit text not null,
  reference_price integer,
  price_status text not null default 'needs_review',
  region text,
  survey_date text,
  source_name text,
  source_url text,
  source_price text,
  source_unit text,
  conversion_note text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reference_prices drop constraint if exists reference_prices_status_check;
alter table public.reference_prices add constraint reference_prices_status_check
  check (price_status in ('confirmed', 'estimated', 'needs_review'));

alter table public.reference_prices drop constraint if exists reference_prices_price_required;
alter table public.reference_prices add constraint reference_prices_price_required
  check (price_status = 'needs_review' or reference_price is not null);

alter table public.reference_prices drop constraint if exists reference_prices_item_name_key;
alter table public.reference_prices add constraint reference_prices_item_name_key unique (item_name);

alter table public.reference_prices enable row level security;

drop policy if exists "reference_prices_public_read" on public.reference_prices;
create policy "reference_prices_public_read" on public.reference_prices for select using (true);

insert into public.reference_prices
  (item_name, category, unit, reference_price, price_status, region, survey_date, source_name, source_url, source_price, source_unit, conversion_note, note)
values
  ('米（5kg）', '米・パン・麺類', '5kg 1袋', 4150, 'confirmed', '全国', '2026年7月', '総務省 小売物価統計調査 (日本の物価 集計)', 'https://www.jpmarket-conditions.com/1002/', '4154円 / 5kg', '5kg 1袋', '端数を丸めて4150円', '単一原料米 コシヒカリ除く の全国平均。ブランド米は約5000円'),
  ('食パン', '米・パン・麺類', '1斤 6枚切り 約340g', 180, 'confirmed', '全国', '2026年5月', '総務省 小売物価統計調査 (日本の物価 集計)', 'https://www.jpmarket-conditions.com/1021/', '約519円 / 1kg', '1kg', '1kg単価519円の0.34kg分で約176円を約180円に丸め', '銘柄や枚数で変動'),
  ('うどん', '米・パン・麺類', '1袋 ゆで 約200g', null, 'needs_review', null, null, null, null, null, null, null, '公的価格を取得できず。要確認'),
  ('スパゲッティ', '米・パン・麺類', '500g 1袋', null, 'needs_review', null, null, null, null, null, null, null, '公的価格を取得できず。要確認'),
  ('卵', '卵・乳製品', '10個入り1パック', 316, 'confirmed', '全国', '2026年7月', '総務省 小売物価統計調査 (日本の物価 集計)', 'https://www.jpmarket-conditions.com/1341/', '316円 / 10個パック', '10個入りパック', 'なし', '白色卵Lサイズの全国平均'),
  ('牛乳', '卵・乳製品', '1L 1000ml 1本', 266, 'confirmed', '全国', '2026年6月', '総務省 小売物価統計調査 (ねだんチャート 集計)', 'https://nedan-chart.com/items/milk/', '266円 / 1000ml', '1000ml 1本', 'なし', '2026年後半にメーカー値上げあり'),
  ('鶏むね肉', '肉類', '100gあたり', 100, 'estimated', '全国', '2026年', '楽天のグラム単価まとめ Ribbit works 二次情報', 'https://ribbit.konomi.app/price/tori-mune/', '約100円 / 100g', '100g', 'なし', '公的統計は鶏肉のみ。むね肉単独の公的価格は未取得'),
  ('鶏もも肉', '肉類', '100gあたり', 159, 'estimated', '全国', '2026年6月', '総務省 小売物価統計調査 鶏肉ブロイラー 日本の物価 集計', 'https://www.jpmarket-conditions.com/1221/', '159円 / 100g', '100g', 'なし', '統計の鶏肉はもも肉中心。むね肉はこれより安い傾向'),
  ('豚こま肉', '肉類', '100gあたり', null, 'needs_review', '全国', '2026年7月', '総務省 小売物価統計調査 豚肉ばら 日本の物価 集計', 'https://www.jpmarket-conditions.com/1211/', '303円 / 100g ばら肉', '100g', null, 'こま切れ肉の公的価格は未取得。参考 豚ばら肉は100gで303円'),
  ('牛こま肉', '肉類', '100gあたり', null, 'needs_review', null, null, null, null, null, null, null, '公的価格を取得できず。要確認'),
  ('ひき肉', '肉類', '100gあたり', null, 'needs_review', null, null, null, null, null, null, null, '公的価格を取得できず。要確認 合いびき 豚 鶏で差がある'),
  ('キャベツ', '野菜', '1玉 約800g', null, 'needs_review', null, null, '農畜産業振興機構 ベジ探 野菜小売価格動向調査', 'https://vegetan.alic.go.jp/retail-price-trends/price-trend-survey.html', null, null, null, '数値は月別PDFのみで未取得。2026年7月から基準単位が約800g 1玉'),
  ('白菜', '野菜', '1/4玉', null, 'needs_review', null, null, '農畜産業振興機構 ベジ探 野菜小売価格動向調査', 'https://vegetan.alic.go.jp/retail-price-trends/price-trend-survey.html', null, null, null, '数値未取得。要確認'),
  ('玉ねぎ', '野菜', '1個', null, 'needs_review', null, null, '農林水産省 食品価格動向調査 野菜', 'https://www.maff.go.jp/j/zyukyu/anpo/kouri/', null, null, null, '2025年夏の不作で高値傾向との情報のみ。具体的価格は未取得'),
  ('じゃがいも', '野菜', '1個', null, 'needs_review', null, null, '農林水産省 食品価格動向調査 野菜', 'https://www.maff.go.jp/j/zyukyu/anpo/kouri/', null, null, null, '2025年夏の不作で高値傾向との情報のみ。具体的価格は未取得'),
  ('にんじん', '野菜', '1本', null, 'needs_review', null, null, '農畜産業振興機構 ベジ探 野菜小売価格動向調査', 'https://vegetan.alic.go.jp/retail-price-trends/price-trend-survey.html', null, null, null, '数値未取得。要確認'),
  ('もやし', '野菜', '1袋 約200g', null, 'needs_review', null, null, null, null, null, null, null, '公的価格を取得できず。要確認 一般に30から40円と安価'),
  ('トマト', '野菜', '1個', null, 'needs_review', null, null, '農畜産業振興機構 ベジ探 野菜小売価格動向調査', 'https://vegetan.alic.go.jp/retail-price-trends/price-trend-survey.html', null, null, null, '数値未取得。要確認'),
  ('きゅうり', '野菜', '1本', null, 'needs_review', null, null, '農畜産業振興機構 ベジ探 野菜小売価格動向調査', 'https://vegetan.alic.go.jp/retail-price-trends/price-trend-survey.html', null, null, null, '数値未取得。要確認'),
  ('長ねぎ', '野菜', '1本', null, 'needs_review', null, null, '農畜産業振興機構 ベジ探 野菜小売価格動向調査', 'https://vegetan.alic.go.jp/retail-price-trends/price-trend-survey.html', null, null, null, '数値未取得。要確認'),
  ('バナナ', '果物', '1房', null, 'needs_review', null, null, null, null, null, null, null, '公的価格を取得できず。要確認'),
  ('りんご', '果物', '1個', null, 'needs_review', '全国', '2021年10月', '総務省 小売物価統計調査 りんごつがる 日本の物価 集計', 'https://www.jpmarket-conditions.com/1501/', '590円 / 1kg', '1kg', null, '直近データが2021年のため参考価格として不採用。要確認'),
  ('豆腐', '大豆製品', '1丁 約300g', null, 'needs_review', null, null, null, null, null, null, null, '公的価格を取得できず。要確認'),
  ('納豆', '大豆製品', '3パック 1セット', 105, 'estimated', '全国', '2025年', 'E-Housing 日本の食費 記事 二次情報', 'https://e-housing.jp/ja/post/how-much-does-food-really-cost-jp', '約100から110円 / 3パック', '3パック 1セット', '100から110円の中央値105円', '公的統計は未取得。二次情報のため estimated'),
  ('食用油', '調味料・その他', '1L 約1000g 1本', 400, 'confirmed', '全国', '2026年2月', '総務省 小売物価統計調査 日本の物価 集計', 'https://www.jpmarket-conditions.com/1601/', '401円 / 1本 約1000g', '1本 約1000g', '1本を1Lとみなし端数を丸めて400円', 'キャノーラ油等のペットボトル入り'),
  ('しょうゆ', '調味料・その他', '1L 1本', null, 'needs_review', null, null, null, null, null, null, null, '公的価格を取得できず。要確認'),
  ('砂糖', '調味料・その他', '1kg 1袋', null, 'needs_review', null, null, null, null, null, null, null, '公的価格を取得できず。要確認 上白糖'),
  ('塩', '調味料・その他', '1kg 1袋', null, 'needs_review', null, null, null, null, null, null, null, '公的価格を取得できず。要確認'),
  ('カレールー', '調味料・その他', '1箱 約140g', null, 'needs_review', null, null, 'おとくらし 2026年8月から値上げするもの', 'https://otokurashi.jp/price-hike-august-2026/', null, null, null, '2026年8月に値上げ情報あり。具体的価格は未取得。要確認')
on conflict (item_name) do update set
  category = excluded.category,
  unit = excluded.unit,
  reference_price = excluded.reference_price,
  price_status = excluded.price_status,
  region = excluded.region,
  survey_date = excluded.survey_date,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  source_price = excluded.source_price,
  source_unit = excluded.source_unit,
  conversion_note = excluded.conversion_note,
  note = excluded.note,
  updated_at = now();
