// 選ばれた食材の価格を表示する部品。
//
//  ・上段：初期データの「参考価格」（reference_prices）。あれば地域・時期・出典つきで表示。
//  ・下段：店舗別の実売価格（prices）を安い順に縦並び。レシート投稿もここに並ぶ。
//  ・各カードに「1分あたり◯円お得」を出し、「安いが遠い／高いが近い」を比べやすくする。
//  ・店舗別データが無くても値段は推測しない。

import { useEffect, useState } from 'react'
import { formatCheckedAt, isPriceStale } from '../lib/date'
import { getPricesByItem, type ReferencePrice } from '../lib/dataSource'
import type { Price, Store, TransportMode } from '../types'
import { StorePriceCard } from './StorePriceCard'

type Props = {
  /** 表示する食材名（App が確定させたもの） */
  itemName: string
  /** 店舗一覧（App が事前に読み込んで渡す） */
  stores: Store[]
  /** いま選ばれている移動手段（徒歩／自転車） */
  transport: TransportMode
  /** この食材の参考価格（あれば） */
  referencePrice?: ReferencePrice | null
}

type Loaded = {
  itemName: string
  prices: Price[]
}

/** 店舗と、その店の価格をひとまとめにしたもの */
type PricedStore = { price: Price; store: Store }

/** 地域・時期の表示文（"全国平均・2026年7月" など） */
function regionLine(reference: ReferencePrice): string {
  const parts: string[] = []
  if (reference.region) {
    parts.push(reference.region === '全国' ? '全国平均' : reference.region)
  }
  if (reference.surveyDate) parts.push(reference.surveyDate)
  return parts.join('・')
}

function ReferencePriceBox({ reference }: { reference: ReferencePrice }) {
  const hasPrice =
    reference.priceStatus !== 'needs_review' && reference.referencePrice !== null
  const line = regionLine(reference)

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
          参考価格
        </span>
        {reference.priceStatus === 'estimated' && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            概算
          </span>
        )}
        {reference.priceStatus === 'needs_review' && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
            要確認
          </span>
        )}
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-sm text-gray-500">{reference.unit}</p>
        {hasPrice ? (
          <p className="text-2xl font-bold tabular-nums">
            約{reference.referencePrice?.toLocaleString()}
            <span className="ml-0.5 text-sm font-semibold">円</span>
          </p>
        ) : (
          <p className="text-base font-medium text-gray-400">価格確認中</p>
        )}
      </div>

      {line !== '' && <p className="mt-1 text-xs text-gray-400">{line}</p>}
      {reference.note && (
        <p className="mt-1 text-xs text-gray-400">{reference.note}</p>
      )}
      {reference.sourceName && (
        <p className="mt-2 border-t border-gray-100 pt-2 text-xs text-gray-400">
          出典：
          {reference.sourceUrl ? (
            <a
              href={reference.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {reference.sourceName}
            </a>
          ) : (
            reference.sourceName
          )}
        </p>
      )}
    </div>
  )
}

/** 「1分あたり◯円」の表示（10円以上は整数、未満は小数第1位まで） */
function formatPerMinute(value: number): string {
  if (value >= 10) return String(Math.round(value))
  return String(Math.round(value * 10) / 10)
}

/**
 * カード下部の一言。「最安店との差額 ÷ 余分にかかる移動時間」で
 * 「1分あたり◯円お得」を出し、遠くても行く価値があるかを示す。
 */
function valueNote(
  row: PricedStore,
  ctx: {
    isCheapest: boolean
    cheapestRow: PricedStore
    closestRow: PricedStore
    minutesOf: (store: Store) => number
  },
): { text: string; tone: 'good' | 'muted' } {
  const { isCheapest, cheapestRow, closestRow, minutesOf } = ctx

  if (isCheapest) {
    if (row === closestRow) {
      return { text: '最安、しかもいちばん近い', tone: 'good' }
    }
    // 最安店は「いちばん近い店」と比べて、余分な移動1分あたりいくら安いか
    const extraMinutes = minutesOf(row.store) - minutesOf(closestRow.store)
    const saving = closestRow.price.price - row.price.price
    if (extraMinutes > 0 && saving > 0) {
      return {
        text: `最寄り店より1分あたり${formatPerMinute(saving / extraMinutes)}円お得`,
        tone: 'good',
      }
    }
    return { text: '最安値', tone: 'good' }
  }

  // 最安店より近い店 → 「最安店まで足をのばすと、余分な移動1分あたりいくら安いか」
  const detourMinutes = minutesOf(cheapestRow.store) - minutesOf(row.store)
  const diff = row.price.price - cheapestRow.price.price
  if (detourMinutes > 0 && diff > 0) {
    return {
      text: `最安店へ寄ると1分あたり${formatPerMinute(diff / detourMinutes)}円お得`,
      tone: 'good',
    }
  }
  // 最安店より遠く、しかも高い → わざわざ行く理由がない
  return { text: '最安店のほうが安くて近い', tone: 'muted' }
}

function StorePrices({
  itemName,
  prices,
  stores,
  transport,
  hasReference,
}: {
  itemName: string
  prices: Price[] | null
  stores: Store[]
  transport: TransportMode
  hasReference: boolean
}) {
  if (prices === null) {
    return <p className="py-8 text-center text-sm text-gray-500">読み込み中…</p>
  }

  const rows: PricedStore[] = [...prices]
    .sort((a, b) => a.price - b.price)
    .map((price) => {
      const store = stores.find((candidate) => candidate.id === price.storeId)
      return store ? { price, store } : null
    })
    .filter((row): row is PricedStore => row !== null)

  if (rows.length === 0) {
    return (
      <div className="rounded-xl bg-gray-50 p-5 text-center">
        <p className="text-sm text-gray-500">
          この食材の店舗別の価格・レシート投稿はまだありません。
        </p>
        {!hasReference && (
          <p className="mt-1 text-sm text-gray-500">
            価格がそろうと、ここに安い順で表示されます。値段は推測しません。
          </p>
        )}
      </div>
    )
  }

  const minutesOf = (store: Store) =>
    transport === 'bike' ? store.bikeMinutes : store.walkMinutes

  const cheapestRow = rows[0]
  const cheapestPrice = cheapestRow.price.price
  const closestRow = rows.reduce(
    (best, row) => (minutesOf(row.store) < minutesOf(best.store) ? row : best),
    rows[0],
  )
  const cheapestIsStale = isPriceStale(cheapestRow.price.checkedAt)
  const hasSample = rows.some((row) => row.price.source === 'sample')

  return (
    <div>
      <h3 className="mb-1 text-sm font-bold text-gray-700">
        「{itemName}」の最安値を比較
      </h3>
      <p className="mb-3 text-xs text-gray-400">
        {cheapestRow.price.unit}／
        {transport === 'bike' ? '自転車' : '徒歩'}での所要時間で表示中
      </p>

      {cheapestIsStale && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
          いちばん安い店の価格は確認から日数がたっています。変わっているかもしれません。
        </p>
      )}

      <ul className="space-y-3">
        {rows.map((row, index) => {
          const isCheapest = row.price.price === cheapestPrice
          const note = valueNote(row, {
            isCheapest,
            cheapestRow,
            closestRow,
            minutesOf,
          })
          return (
            <StorePriceCard
              key={row.price.id}
              rank={index + 1}
              store={row.store}
              price={row.price.price}
              unit={row.price.unit}
              transport={transport}
              diffFromCheapest={row.price.price - cheapestPrice}
              isCheapest={isCheapest}
              valueText={note.text}
              valueTone={note.tone}
              checkedLabel={formatCheckedAt(row.price.checkedAt)}
              isStale={isPriceStale(row.price.checkedAt)}
              source={row.price.source}
            />
          )
        })}
      </ul>

      <p className="mt-3 rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
        「1分あたり◯円お得」＝最安店まで足をのばすと、余分な移動1分あたりいくら安くなるか。
        数字が大きいほど「遠くても行く価値」があります。
      </p>

      {hasSample && (
        <p className="mt-2 text-xs text-gray-400">
          ※「サンプル」は動作確認用の仮の価格です。実際の店頭価格ではありません。
        </p>
      )}
    </div>
  )
}

export function PriceComparison({
  itemName,
  stores,
  transport,
  referencePrice,
}: Props) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    let isCurrent = true
    getPricesByItem(itemName)
      .then((result) => {
        if (isCurrent) setLoaded({ itemName, prices: result })
      })
      .catch(() => {
        // 失敗時も「読み込み中…」で固まらないよう空扱いにする
        if (isCurrent) setLoaded({ itemName, prices: [] })
      })
    return () => {
      isCurrent = false
    }
  }, [itemName])

  const prices = loaded && loaded.itemName === itemName ? loaded.prices : null

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">「{itemName}」の価格</h2>

      {referencePrice && (
        <div className="mb-4">
          <ReferencePriceBox reference={referencePrice} />
        </div>
      )}

      <StorePrices
        itemName={itemName}
        prices={prices}
        stores={stores}
        transport={transport}
        hasReference={Boolean(referencePrice)}
      />
    </section>
  )
}
