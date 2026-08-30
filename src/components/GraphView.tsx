// 下部タブ「グラフ」の中身。
// 選択中の食材について、店舗別の価格推移を折れ線グラフ（recharts）で表示する。
//
// 【重要】実際の履歴データはまだ存在しない。
//   ここに出る過去の線は「デモ用の仮の値」であり、実データではない。
//   - 目立つ注意バナー
//   - グラフ上に「デモ」の透かし
//   - 線はすべて破線（＝仮データの合図）
//   - 今月ぶんだけ現在の登録価格に合わせ、過去は種から生成した仮の値
//   を必ず出して、実データがあるように見せないこと。

import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getPricesByItem } from '../lib/dataSource'
import type { Price, Store } from '../types'

type Props = {
  /** グラフにする食材名。未選択なら null */
  itemName: string | null
  stores: Store[]
  /** 店舗価格がある食材名の一覧（食材ピッカー用） */
  itemNames: string[]
  /** 食材を選ぶ／選び直す（'' で未選択に戻す） */
  onPickItem: (name: string) => void
}

const LINE_COLORS = [
  '#059669',
  '#e11d48',
  '#2563eb',
  '#d97706',
  '#7c3aed',
  '#0891b2',
]
const MONTHS_BACK = 6

/** 文字列 → 0..1 の決まった数（デモ用の擬似乱数の種） */
function seed(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

/** 直近 MONTHS_BACK か月のラベル（"3月" など。最後が今月） */
function monthLabels(now = new Date()): string[] {
  const labels: string[] = []
  for (let i = MONTHS_BACK - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(`${d.getMonth() + 1}月`)
  }
  return labels
}

type ChartRow = Record<string, number | string>
type NamedPrice = { name: string; current: number; id: string }

/** デモ用の推移データを作る（今月＝現在価格、過去＝種から生成した仮の値） */
function buildDemoSeries(
  prices: Price[],
  stores: Store[],
): { rows: ChartRow[]; storeNames: string[] } {
  const labels = monthLabels()
  const named: NamedPrice[] = prices
    .map((price) => {
      const store = stores.find((candidate) => candidate.id === price.storeId)
      return store
        ? { name: store.name, current: price.price, id: price.storeId }
        : null
    })
    .filter((value): value is NamedPrice => value !== null)
    .sort((a, b) => a.current - b.current)

  const lastIndex = labels.length - 1
  const rows: ChartRow[] = labels.map((label, monthIndex) => {
    const row: ChartRow = { month: label }
    for (const store of named) {
      if (monthIndex === lastIndex) {
        row[store.name] = store.current
      } else {
        const wave = Math.sin((monthIndex + seed(store.id) * 6) * 0.9) * 0.06
        const trend =
          (lastIndex - monthIndex) * 0.012 * (seed(`${store.id}x`) - 0.5) * 2
        row[store.name] = Math.max(
          1,
          Math.round(store.current * (1 + wave + trend)),
        )
      }
    }
    return row
  })

  return { rows, storeNames: named.map((store) => store.name) }
}

type Loaded = { itemName: string; prices: Price[] }

export function GraphView({ itemName, stores, itemNames, onPickItem }: Props) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    if (!itemName) return
    let alive = true
    getPricesByItem(itemName)
      .then((result) => {
        if (alive) setLoaded({ itemName, prices: result })
      })
      .catch(() => {
        // 失敗しても「読み込み中…」で固まらないよう空扱いにする
        if (alive) setLoaded({ itemName, prices: [] })
      })
    return () => {
      alive = false
    }
  }, [itemName])

  // itemName に対応する取得結果だけを使う（別の食材の残りを表示しない）
  const prices =
    loaded && itemName && loaded.itemName === itemName ? loaded.prices : null

  const chart = useMemo(
    () => (prices && prices.length > 0 ? buildDemoSeries(prices, stores) : null),
    [prices, stores],
  )

  // --- 食材が未選択：ピッカーを出す ---
  if (!itemName) {
    return (
      <div className="mt-4">
        <p className="text-sm font-bold text-gray-700">
          グラフにする食材を選んでください
        </p>
        {itemNames.length === 0 ? (
          <p className="mt-3 rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500">
            まだ店舗価格のデータがないため、グラフを表示できません。
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {itemNames.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => onPickItem(name)}
                  className="rounded-full border border-gray-300 bg-white px-4 py-2.5 text-base active:bg-gray-100"
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  // --- 食材が選択済み：グラフ（デモ） ---
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => onPickItem('')}
        className="text-sm text-gray-500 underline active:text-gray-900"
      >
        ← 食材を選び直す
      </button>

      <h2 className="mt-3 text-lg font-bold">
        「{itemName}」の価格推移（デモ）
      </h2>

      <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
        ※このグラフは<b>デモ表示</b>です。実際の価格推移は、レシート投稿が
        数か月ぶんたまってから表示されます。いま表示している破線は仮の値で、
        今月ぶんだけ現在の登録価格に合わせています。
      </div>

      {prices === null && (
        <p className="mt-6 text-center text-sm text-gray-500">読み込み中…</p>
      )}

      {prices !== null && !chart && (
        <p className="mt-6 rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500">
          「{itemName}」の店舗価格がまだ登録されていないため、グラフを表示できません。
        </p>
      )}

      {chart && (
        <div className="relative mt-4">
          <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-5xl font-black text-gray-400/20">
            デモ
          </span>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chart.rows}
                margin={{ top: 8, right: 8, bottom: 4, left: -12 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis
                  width={48}
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  domain={['dataMin - 20', 'dataMax + 20']}
                />
                <Tooltip formatter={(value) => `${value}円`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {chart.storeNames.map((name, index) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={LINE_COLORS[index % LINE_COLORS.length]}
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={{ r: 3 }}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            縦軸：価格（円）／横軸：月。破線は「仮データ」の合図です。
          </p>
        </div>
      )}
    </div>
  )
}
