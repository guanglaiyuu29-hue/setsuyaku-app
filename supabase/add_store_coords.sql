-- ============================================================
-- 食材価格くらべ：店舗の緯度経度カラムを追加し、4店舗に座標を入れる
--
-- ▼ 実行場所
--   Supabase 管理画面 → 「SQL Editor」→「New query」→ 貼り付け →「Run」
--   何度実行しても壊れません（add column if not exists / update）。
--
-- ▼ 前提
--   先に supabase/setup_stores_prices.sql（または schema.sql）を実行して
--   stores テーブルと4店舗が入っていること。
--
-- ▼ 座標について（重要）
--   このアプリの4店舗はデモ用の店舗です。座標は「店名にある地名の中心付近」を
--   示すおおよその位置で、正確な店舗所在地ではありません。
--   （イオン北大路のみ、実在するイオンモール北大路の位置に合わせています）
-- ============================================================

alter table public.stores add column if not exists lat double precision;
alter table public.stores add column if not exists lng double precision;

update public.stores set lat = 35.0472, lng = 135.7667
  where id = 'sandy-shimogamo';
update public.stores set lat = 35.0451, lng = 135.7583
  where id = 'aeon-kitaoji';
update public.stores set lat = 35.0007, lng = 135.7660
  where id = 'life-matsubara';
update public.stores set lat = 35.0298, lng = 135.7715
  where id = 'sugi-demachiyanagi';
