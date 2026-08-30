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

## タスク2: グラフ機能 ✅ 完了
- recharts 導入。`src/components/GraphView.tsx` 新規：選択食材の店舗別価格推移を折れ線グラフ表示
- 【デモ明示】実履歴が無いため、過去5か月は「種から生成した仮の値」、今月ぶんだけ現在の登録価格。
  - 上部に amber の注意バナー（「デモ表示」太字）
  - グラフ上に「デモ」透かし
  - 線はすべて破線（＝仮データの合図）＋凡例下に注記
  - タイトルも「（デモ）」
- 食材未選択時は食材ピッカー、「← 食材を選び直す」で戻れる
- App: MapView / GraphView を `React.lazy` + `Suspense` で遅延読み込みに変更（初期バンドル 439KB に維持、Map 156KB / Graph 369KB は別チャンク）
- 未使用になった `ComingSoon` を削除
- build ✅ / lint ✅（クリーン）

## タスク3: レシート投稿の動作確認・修正 ✅ 完了
- コードレビューで全フローを追跡（アプリを実サーバーに繋いだ実機確認はローカルに .env が無いため不可。手順は TODO_FOR_USER に記載）
- フロー: 「レシートを投稿」→(未ログインならログイン)→画像/店舗/日付/品目入力→submitReceipt が
  Storage `receipts/${uid}/...` にアップロード→`prices` に `source='receipt'` で行追加→ありがとう画面→
  品目タップで比較画面（`getPricesByItem` が最新を再取得）に反映。RLS・Storage ポリシー・列名すべて整合を確認。
- **修正1**: 「レシートを投稿」から未ログインでログインに入ると、ログイン後に main に戻ってしまい
  もう一度ボタンを押す必要があった → `afterLogin` を持たせ、ログイン成功後に自動でレシート画面へ。
- **修正2**: `submitReceipt` のエラー文言を日本語化（RLS 権限・バケット未作成・サイズ超過・通信失敗など）。
- 既知の注意（TODO_FOR_USER に記載）: 購入日を過去にすると、`checked_at` が新しいサンプル価格に隠れて
  比較画面で見えないことがある（＝仕様。最新の確認日を優先表示）。iPhone の HEIC で type 空だと弾かれる場合あり。
- build ✅ / lint ✅

## タスク4: 全体の品質改善（375px・エラー表示・不要コード削除）
- [ ] 着手

## タスク5: ドキュメント整備（README / TODO_FOR_USER.md）
- [ ] 未着手

---

## ログ
- (開始) 既存コード確認完了。src/data/ は未使用（どこからも import されていない）と確認。
