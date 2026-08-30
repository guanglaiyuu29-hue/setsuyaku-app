// 1店舗ぶんの価格カード。価格が主役になるようにレイアウトする。
// 確認から日数がたった価格（isStale）は、最新の価格と見分けられるよう
// グレーアウトし、「情報が古い可能性」の注意を出す。

import type { PriceSource, Store } from '../types'

type Props = {
  /** 店舗情報 */
  store: Store
  /** その店の価格（円） */
  price: number
  /** 単位・内容量（例: "10個入り1パック"） */
  unit: string
  /** 一番安い店との差額（円）。最安店なら 0 */
  diffFromCheapest: number
  /** この店が最安かどうか */
  isCheapest: boolean
  /** "3日前に確認" などの文字 */
  checkedLabel: string
  /** 確認から日数がたち「古い可能性あり」か */
  isStale: boolean
  /** 価格の出所（'receipt' なら利用者のレシート投稿） */
  source?: PriceSource
}

export function StorePriceCard({
  store,
  price,
  unit,
  diffFromCheapest,
  isCheapest,
  checkedLabel,
  isStale,
  source,
}: Props) {
  return (
    <li
      className={`rounded-xl border p-4 ${
        isStale
          ? 'border-gray-200 bg-gray-50'
          : isCheapest
            ? 'border-gray-900'
            : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-base font-semibold ${isStale ? 'text-gray-500' : ''}`}
            >
              {store.name}
            </h3>
            {isCheapest && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${
                  isStale ? 'bg-gray-400' : 'bg-gray-900'
                }`}
              >
                最安
              </span>
            )}
            {source === 'receipt' && (
              <span className="rounded-full border border-gray-300 px-2 py-0.5 text-xs text-gray-500">
                レシート投稿
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            徒歩{store.walkMinutes}分 ・ 自転車{store.bikeMinutes}分
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p
            className={`text-3xl font-bold leading-none tabular-nums ${
              isStale ? 'text-gray-400' : ''
            }`}
          >
            {price.toLocaleString()}
            <span className="ml-0.5 text-base font-semibold">円</span>
          </p>
          <p className="mt-1 text-sm text-gray-500 tabular-nums">
            {isCheapest ? 'この中で最安' : `+${diffFromCheapest.toLocaleString()}円`}
          </p>
        </div>
      </div>

      {isStale && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
          情報が古い可能性があります（{checkedLabel}）。店頭で必ず確認してください。
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-2 text-xs text-gray-400">
        <span>{unit}</span>
        <span>{checkedLabel}</span>
      </div>

      {store.note !== '' && (
        <p className="mt-2 text-xs text-gray-400">{store.note}</p>
      )}
    </li>
  )
}
