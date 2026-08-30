# 食材価格くらべ（ベータ版）

京都・一人暮らしの大学生向け、食材の価格をくらべる Web アプリ。

- Vite + React + TypeScript / Tailwind CSS v4
- バックエンドは Supabase（データベース・認証・画像保存）
- 状態管理ライブラリなし（React の標準機能のみ）

## 開発

```bash
npm install
npm run dev      # 開発サーバー
npm run build    # 本番ビルド（dist/ に出力）
npm run lint     # oxlint
```

`.env`（Git 管理外）に Supabase の接続情報が必要：

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Supabase のセットアップ（SQL Editor で順に実行）

| 順 | ファイル | 内容 |
|---|---|---|
| 1 | `supabase/schema.sql` | stores / prices テーブル、RLS、レシート用 Storage |
| 2 | `supabase/seed.sql` | 店舗4件・サンプル実売価格（架空データ。任意） |
| 3 | `supabase/02_receipts.sql` | 既存DBにレシート投稿機能ぶんを追加 |
| 4 | `supabase/initial_food_prices.sql` | 初期「参考価格」データ（reference_prices テーブル） |

いずれも **何度実行しても重複しません**。

## データの種類

| 種類 | テーブル | 画面表示 |
|---|---|---|
| 参考価格（初期データ・概算） | `reference_prices` | 「参考価格」タグ＋地域・時期・出典 |
| 店舗別の実売価格（運営調査） | `prices` (`source='official'`) | 店舗カード |
| 利用者のレシート投稿 | `prices` (`source='receipt'`) | 店舗カード＋「レシート投稿」タグ |

**参考価格の多くは全国平均**です（京都市単独のデータは未取得）。各食材に地域を表示します。

## 参考価格を更新する手順

1. **価格を調べる** … 優先度: ①京都市 ②京都の大手スーパー/ネットスーパー ③近畿 ④全国平均。
   情報源は総務省「小売物価統計調査」、農水省「食品価格動向調査」、ALIC「ベジ探」、
   スーパー/ネットスーパー公式などを優先。特売・会員価格は使わない。
2. **`supabase/initial_food_prices.sql` を編集** … 各行の `reference_price` / `price_status` /
   `region` / `survey_date` / `source_name` / `source_url` / `source_price` /
   `conversion_note` / `note` を更新。
   - `price_status`: `confirmed`（公的統計そのもの）/ `estimated`（換算・概算）/ `needs_review`（根拠不足）
   - 単位を換算したら `conversion_note` に計算式を必ず残す
3. **Supabase SQL Editor で実行** … ファイルを貼り付けて Run（UPSERT なので上書き更新）
4. **GitHub へ push**
   ```bash
   git add -A
   git commit -m "参考価格を更新"
   git push
   ```
5. **Netlify が自動デプロイ**（1〜3分）
6. **公開サイトで確認** … 検索ボックスが空の状態で参考価格の一覧が出る
