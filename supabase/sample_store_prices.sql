alter table public.prices drop constraint if exists prices_source_check;
alter table public.prices add constraint prices_source_check
  check (source in ('official', 'receipt', 'sample'));

insert into public.stores (id, name, walk_minutes, bike_minutes, note) values
  ('sandy-shimogamo', 'サンディ下鴨店', 25, 8, 'ディスカウントスーパー。価格重視で品ぞろえは日により変動'),
  ('aeon-kitaoji', 'イオン北大路店', 12, 4, '大型総合スーパー。品ぞろえが豊富'),
  ('life-matsubara', 'ライフ松原店', 18, 6, '品質重視。夕方以降は総菜が値引き'),
  ('sugi-demachiyanagi', 'スギ薬局出町柳店', 8, 3, 'ドラッグストア。食品は日用品のついで買い向き')
on conflict (id) do update set
  name = excluded.name,
  walk_minutes = excluded.walk_minutes,
  bike_minutes = excluded.bike_minutes,
  note = excluded.note;

delete from public.prices where source = 'sample';

insert into public.prices (item_name, store_id, price, unit, checked_at, source)
select v.item_name, v.store_id, v.price, v.unit, current_date, 'sample'
from (values
  ('卵', 'sandy-shimogamo', 268, '10個入り1パック'),
  ('卵', 'aeon-kitaoji', 298, '10個入り1パック'),
  ('卵', 'sugi-demachiyanagi', 305, '10個入り1パック'),
  ('卵', 'life-matsubara', 316, '10個入り1パック'),
  ('牛乳', 'sandy-shimogamo', 228, '1L 1000ml'),
  ('牛乳', 'aeon-kitaoji', 245, '1L 1000ml'),
  ('牛乳', 'sugi-demachiyanagi', 258, '1L 1000ml'),
  ('牛乳', 'life-matsubara', 275, '1L 1000ml'),
  ('食パン', 'sandy-shimogamo', 148, '1斤 6枚切り'),
  ('食パン', 'aeon-kitaoji', 168, '1斤 6枚切り'),
  ('食パン', 'sugi-demachiyanagi', 178, '1斤 6枚切り'),
  ('食パン', 'life-matsubara', 198, '1斤 6枚切り'),
  ('米（5kg）', 'sandy-shimogamo', 3580, '5kg 1袋'),
  ('米（5kg）', 'aeon-kitaoji', 3880, '5kg 1袋'),
  ('米（5kg）', 'sugi-demachiyanagi', 4080, '5kg 1袋'),
  ('米（5kg）', 'life-matsubara', 4380, '5kg 1袋'),
  ('鶏むね肉', 'sandy-shimogamo', 78, '100gあたり'),
  ('鶏むね肉', 'aeon-kitaoji', 88, '100gあたり'),
  ('鶏むね肉', 'sugi-demachiyanagi', 95, '100gあたり'),
  ('鶏むね肉', 'life-matsubara', 108, '100gあたり'),
  ('納豆', 'sandy-shimogamo', 88, '3パック 1セット'),
  ('納豆', 'aeon-kitaoji', 95, '3パック 1セット'),
  ('納豆', 'sugi-demachiyanagi', 99, '3パック 1セット'),
  ('納豆', 'life-matsubara', 115, '3パック 1セット'),
  ('豆腐', 'sandy-shimogamo', 55, '1丁 約300g'),
  ('豆腐', 'aeon-kitaoji', 62, '1丁 約300g'),
  ('豆腐', 'sugi-demachiyanagi', 68, '1丁 約300g'),
  ('豆腐', 'life-matsubara', 78, '1丁 約300g'),
  ('もやし', 'sandy-shimogamo', 28, '1袋 約200g'),
  ('もやし', 'aeon-kitaoji', 31, '1袋 約200g'),
  ('もやし', 'sugi-demachiyanagi', 33, '1袋 約200g'),
  ('もやし', 'life-matsubara', 39, '1袋 約200g')
) as v(item_name, store_id, price, unit);
