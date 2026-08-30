// 1店舗ぶんの価格カード。
// ・左に順位の丸数字（1位は緑、他はグレー）
// ・最安店は価格が緑・右上に「最安」バッジ・カード背景が薄い緑
// ・他店は価格が黒・赤文字で最安との差額
// ・右下に移動手段アイコンと所要時間（App のトグルで徒歩／自転車が切り替わる）
// ・下部に「1分あたり◯円お得」（安いが遠い／高いが近い の判断材料）
// ・確認から日数がたった価格（isStale）はグレーアウトして注意表示

import type { PriceSource, Store, TransportMode } from '../types'

type Props = {
  /** 安い順の順位（1 から） */
  rank: number
  /** 店舗情報 */
  store: Store
  /** その店の価格（円） */
  price: number
  /** 単位・内容量（例: "10個入り1パック"） */
  unit: string
  /** いま選ばれている移動手段 */
  transport: TransportMode
  /** 一番安い店との差額（円）。最安店なら 0 */
  diffFromCheapest: number
  /** この店が最安かどうか */
  isCheapest: boolean
  /** 「1分あたり◯円お得」などの一言。無ければ null */
  valueText: string | null
  /** その一言の色味（good=緑で強調 / muted=グレー） */
  valueTone: 'good' | 'muted'
  /** "3日前に確認" などの文字 */
  checkedLabel: string
  /** 確認から日数がたち「古い可能性あり」か */
  isStale: boolean
  /** 価格の出所（'receipt' なら利用者のレシート投稿、'sample' は仮データ） */
  source?: PriceSource
}

function WalkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="13" cy="4" r="2" />
      <path d="M13 22l-1.5-6-3-2.5 1-5M9.5 8.5 14 11l1.5 4M15 22l-2-6" />
    </svg>
  )
}

function BikeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M14 6h3l3 6M5.5 17.5 10 8h5M10 8 8.5 5H6" />
    </svg>
  )
}

export function StorePriceCard({
  rank,
  store,
  price,
  unit,
  transport,
  diffFromCheapest,
  isCheapest,
  valueText,
  valueTone,
  checkedLabel,
  isStale,
  source,
}: Props) {
  const minutes = transport === 'bike' ? store.bikeMinutes : store.walkMinutes
  const modeLabel = transport === 'bike' ? '自転車' : '徒歩'

  return (
    <li
      className={`rounded-2xl border p-4 ${
        isCheapest
          ? 'border-emerald-500 bg-emerald-50'
          : isStale
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
            isCheapest ? 'bg-emerald-600' : 'bg-gray-400'
          }`}
        >
          {rank}
        </span>
        <h3
          className={`min-w-0 flex-1 truncate text-base font-bold ${
            isStale && !isCheapest ? 'text-gray-500' : 'text-gray-900'
          }`}
        >
          {store.name}
        </h3>
        {isCheapest ? (
          <span className="shrink-0 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white">
            最安
          </span>
        ) : (
          <span className="shrink-0 text-sm font-bold tabular-nums text-red-500">
            +{diffFromCheapest.toLocaleString()}円
          </span>
        )}
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <p
          className={`text-3xl font-extrabold leading-none tabular-nums ${
            isCheapest
              ? 'text-emerald-600'
              : isStale
                ? 'text-gray-400'
                : 'text-gray-900'
          }`}
        >
          {price.toLocaleString()}
          <span className="ml-0.5 text-base font-bold">円</span>
        </p>
        <p className="flex shrink-0 items-center gap-1 text-sm font-semibold text-gray-600">
          {transport === 'bike' ? <BikeIcon /> : <WalkIcon />}
          <span className="tabular-nums">
            {modeLabel} {minutes}分
          </span>
        </p>
      </div>

      <p className="mt-1 text-xs text-gray-400">{unit}</p>

      {(source === 'sample' || source === 'receipt') && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {source === 'sample' && (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
              サンプル
            </span>
          )}
          {source === 'receipt' && (
            <span className="rounded-full border border-gray-300 px-2 py-0.5 text-xs text-gray-500">
              レシート投稿
            </span>
          )}
        </div>
      )}

      {valueText && (
        <p
          className={`mt-2 border-t border-gray-100 pt-2 text-xs font-medium ${
            valueTone === 'good' ? 'text-emerald-700' : 'text-gray-400'
          }`}
        >
          {valueTone === 'good' ? '✨ ' : ''}
          {valueText}
        </p>
      )}

      {isStale && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          この価格は{checkedLabel}のものです。店頭で必ず確認してください。
        </p>
      )}
    </li>
  )
}
