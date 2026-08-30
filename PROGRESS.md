# 自律作業の進捗ログ

作業ブランチ: `main` / 作業フォルダ: `C:\Users\kekoh\Desktop\setsuyaku-app-restored`
リモート: https://github.com/guanglaiyuu29-hue/setsuyaku-app （Netlify 連携先。確認済み）

開始時点の HEAD: `deb7344`（価格比較画面の刷新）

## 進め方
各タスク完了時に build（`tsc -b && vite build`）+ lint（`oxlint`）が通ることを確認 → commit → push。
SQL は実行できないので `supabase/*.sql` に保存し、手順を README / TODO_FOR_USER に残す。
迷ったら安全側（実データがあるように見せない・既存機能を壊さない）。

---

## タスク1: マップ機能 ✅ 完了（commit 予定）
- Leaflet + react-leaflet + OpenStreetMap（APIキー不要）を導入
- `src/components/MapView.tsx` 新規：店舗ピン（SVG divIcon）、タップで店舗名＋徒歩/自転車の所要時間＋メモを表示、fitBounds で全店表示
- 座標未登録時は地図を出さず `add_store_coords.sql` 実行案内を表示（＝SQL未実行でも既存機能に影響なし）
- `supabase/add_store_coords.sql` 新規：stores に lat/lng カラム追加＋4店舗に座標。座標はデモ用のおおよその位置（イオン北大路のみ実在モールの位置に合わせた。他はフィクション店舗）
- `getStores()` を `select('*')` に変更（lat/lng 列が無くてもエラーにならないように）
- `Store` 型に `lat: number | null` / `lng: number | null` を追加
- 未使用の `src/data/stores.ts` `src/data/prices.ts` を削除（どこからも import されていない）
- build ✅ / lint ✅（バンドルは leaflet 分で 594KB に増加。初期ロード削減は タスク4 で lazy import 予定）

## タスク2: グラフ機能
- [ ] 着手

## タスク3: レシート投稿の動作確認・修正
- [ ] 未着手

## タスク4: 全体の品質改善（375px・エラー表示・不要コード削除）
- [ ] 未着手

## タスク5: ドキュメント整備（README / TODO_FOR_USER.md）
- [ ] 未着手

---

## ログ
- (開始) 既存コード確認完了。src/data/ は未使用（どこからも import されていない）と確認。
