-- ============================================================
-- 食材価格くらべ：初期データ投入SQL（src/data/ の中身と同じもの）
--
-- ▼ 実行場所
--   schema.sql を実行してテーブルを作った後で、
--   同じ「SQL Editor」に このファイルの中身を貼り付けて「Run」。
--
--   何度流しても重複しないように作ってあります
--   （prices は「テーブルが空のときだけ入れる」書き方にしています）。
--
-- ※ ここの値段はすべて架空のサンプルです。
--    実際に店で調べた値段に置き換えていってください。
-- ============================================================


-- 店舗（4件）------------------------------------------------
insert into public.stores (id, name, walk_minutes, bike_minutes, note) values
  ('aeon-demachiyanagi',        'イオン 出町柳店',       12, 5, 'レジ袋は有料（3円）。深夜0時まで営業'),
  ('fresco-hyakumanben',        'フレスコ 百万遍店',      6, 3, '大学に一番近い。夕方は混雑しやすい'),
  ('gyomu-super-kitashirakawa', '業務スーパー 北白川店',  20, 8, 'まとめ買い向きで安い。品ぞろえは日によって変動'),
  ('life-kawabata',             'ライフ 川端店',         15, 7, '品質重視。20時以降は総菜が値引き')
on conflict (id) do nothing;


-- 価格（48件）----------------------------------------------
-- 「まだ1件も価格が入っていないとき」だけ、まとめて投入します。
insert into public.prices (item_name, store_id, price, unit, checked_at, source)
select
  v.item_name, v.store_id, v.price, v.unit, v.checked_at::date, v.source
from (values
  ('卵', 'aeon-demachiyanagi',        258, '10個入り1パック', '2026-08-28', 'official'),
  ('卵', 'fresco-hyakumanben',        245, '10個入り1パック', '2026-08-29', 'official'),
  ('卵', 'gyomu-super-kitashirakawa', 228, '10個入り1パック', '2026-07-15', 'official'),
  ('卵', 'life-kawabata',             268, '10個入り1パック', '2026-08-29', 'official'),

  ('牛乳', 'aeon-demachiyanagi',        235, '1000ml 1本', '2026-08-28', 'official'),
  ('牛乳', 'fresco-hyakumanben',        218, '1000ml 1本', '2026-08-29', 'official'),
  ('牛乳', 'gyomu-super-kitashirakawa', 198, '1000ml 1本', '2026-08-27', 'official'),
  ('牛乳', 'life-kawabata',             228, '1000ml 1本', '2026-08-29', 'official'),

  ('食パン', 'aeon-demachiyanagi',        168, '6枚切り 1斤', '2026-08-28', 'official'),
  ('食パン', 'fresco-hyakumanben',        158, '6枚切り 1斤', '2026-08-29', 'official'),
  ('食パン', 'gyomu-super-kitashirakawa', 138, '6枚切り 1斤', '2026-08-27', 'official'),
  ('食パン', 'life-kawabata',             178, '6枚切り 1斤', '2026-08-29', 'official'),

  ('米（5kg）', 'aeon-demachiyanagi',        2680, '5kg 1袋', '2026-08-25', 'official'),
  ('米（5kg）', 'fresco-hyakumanben',        2580, '5kg 1袋', '2026-08-26', 'official'),
  ('米（5kg）', 'gyomu-super-kitashirakawa', 2380, '5kg 1袋', '2026-07-10', 'official'),
  ('米（5kg）', 'life-kawabata',             2780, '5kg 1袋', '2026-08-26', 'official'),

  ('鶏むね肉', 'aeon-demachiyanagi',        68, '100gあたり', '2026-08-28', 'official'),
  ('鶏むね肉', 'fresco-hyakumanben',        65, '100gあたり', '2026-08-29', 'official'),
  ('鶏むね肉', 'gyomu-super-kitashirakawa', 58, '100gあたり', '2026-08-27', 'official'),
  ('鶏むね肉', 'life-kawabata',             72, '100gあたり', '2026-08-10', 'official'),

  ('豚こま肉', 'aeon-demachiyanagi',        128, '100gあたり', '2026-08-28', 'official'),
  ('豚こま肉', 'fresco-hyakumanben',        118, '100gあたり', '2026-08-29', 'official'),
  ('豚こま肉', 'gyomu-super-kitashirakawa', 98, '100gあたり', '2026-08-27', 'official'),
  ('豚こま肉', 'life-kawabata',             138, '100gあたり', '2026-08-29', 'official'),

  ('キャベツ', 'aeon-demachiyanagi',        198, '1玉', '2026-08-28', 'official'),
  ('キャベツ', 'fresco-hyakumanben',        178, '1玉', '2026-08-29', 'official'),
  ('キャベツ', 'gyomu-super-kitashirakawa', 148, '1玉', '2026-08-27', 'official'),
  ('キャベツ', 'life-kawabata',             208, '1玉', '2026-08-29', 'official'),

  ('玉ねぎ', 'aeon-demachiyanagi',        68, '1個（バラ売り）', '2026-08-28', 'official'),
  ('玉ねぎ', 'fresco-hyakumanben',        58, '1個（バラ売り）', '2026-08-29', 'official'),
  ('玉ねぎ', 'gyomu-super-kitashirakawa', 45, '1個（バラ売り）', '2026-08-27', 'official'),
  ('玉ねぎ', 'life-kawabata',             65, '1個（バラ売り）', '2026-08-29', 'official'),

  ('にんじん', 'aeon-demachiyanagi',        48, '1本（バラ売り）', '2026-08-28', 'official'),
  ('にんじん', 'fresco-hyakumanben',        42, '1本（バラ売り）', '2026-08-29', 'official'),
  ('にんじん', 'gyomu-super-kitashirakawa', 33, '1本（バラ売り）', '2026-08-27', 'official'),
  ('にんじん', 'life-kawabata',             52, '1本（バラ売り）', '2026-08-29', 'official'),

  ('もやし', 'aeon-demachiyanagi',        38, '200g 1袋', '2026-08-28', 'official'),
  ('もやし', 'fresco-hyakumanben',        33, '200g 1袋', '2026-08-29', 'official'),
  ('もやし', 'gyomu-super-kitashirakawa', 19, '200g 1袋', '2026-08-05', 'official'),
  ('もやし', 'life-kawabata',             39, '200g 1袋', '2026-08-29', 'official'),

  ('豆腐', 'aeon-demachiyanagi',        58, '300g 1丁', '2026-08-28', 'official'),
  ('豆腐', 'fresco-hyakumanben',        52, '300g 1丁', '2026-08-29', 'official'),
  ('豆腐', 'gyomu-super-kitashirakawa', 39, '300g 1丁', '2026-08-27', 'official'),
  ('豆腐', 'life-kawabata',             62, '300g 1丁', '2026-08-29', 'official'),

  ('納豆', 'aeon-demachiyanagi',        98, '3パック 1セット', '2026-08-28', 'official'),
  ('納豆', 'fresco-hyakumanben',        88, '3パック 1セット', '2026-08-29', 'official'),
  ('納豆', 'gyomu-super-kitashirakawa', 68, '3パック 1セット', '2026-08-27', 'official'),
  ('納豆', 'life-kawabata',             108, '3パック 1セット', '2026-08-29', 'official')
) as v(item_name, store_id, price, unit, checked_at, source)
where not exists (select 1 from public.prices);
