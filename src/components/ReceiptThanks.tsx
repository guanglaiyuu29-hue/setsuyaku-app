// レシート投稿が完了したあとの「ありがとう画面」。
// 投稿した商品名をボタンで並べ、押すとその食材の価格比較画面へ移動する
// （＝自分の投稿が反映されていることを確認できる）。

import type { SubmittedSummary } from './ReceiptForm'

type Props = {
  summary: SubmittedSummary
  onViewItem: (itemName: string) => void
  onPostAnother: () => void
  onHome: () => void
}

export function ReceiptThanks({
  summary,
  onViewItem,
  onPostAnother,
  onHome,
}: Props) {
  return (
    <div className="mt-6">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-lg font-bold">ありがとうございます！</p>
        <p className="mt-2 text-sm text-gray-600">
          {summary.storeName}（{summary.purchasedOn}）の価格を
          {summary.itemNames.length}件、登録しました。
        </p>
      </div>

      <p className="mt-6 text-sm font-medium">
        投稿した価格を、比較画面で確認できます
      </p>
      <p className="mt-1 text-xs text-gray-500">
        商品名を押すと、その食材の価格一覧が開きます。あなたが入力した価格が反映されているはずです。
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {summary.itemNames.map((name) => (
          <li key={name}>
            <button
              type="button"
              onClick={() => onViewItem(name)}
              className="rounded-full border border-gray-300 bg-white px-4 py-2.5 text-base active:bg-gray-100"
            >
              {name} を見る
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 space-y-2">
        <button
          type="button"
          onClick={onPostAnother}
          className="w-full rounded-xl border border-gray-300 py-3 text-base font-medium active:bg-gray-100"
        >
          続けて別のレシートを投稿
        </button>
        <button
          type="button"
          onClick={onHome}
          className="w-full py-3 text-sm text-gray-500 underline active:text-gray-900"
        >
          トップに戻る
        </button>
      </div>
    </div>
  )
}
