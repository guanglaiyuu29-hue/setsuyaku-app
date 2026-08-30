// 選ばれた食材の価格を表示する部品。
//
//  ・上段：初期データの「参考価格」（reference_prices）。あれば必ず地域・時期・出典つきで表示。
//  ・下段：店舗別の実売価格（prices）。利用者のレシート投稿もここに「レシート投稿」タグ付きで並ぶ。
//  ・店舗別データが無くても値段は推測しない。

import { useEffect, useState } from 'react'
import { formatCheckedAt, isPriceStale } from '../lib/date'
import { getPricesByItem, type ReferencePrice } from '../lib/dataSource'
import type { Price, Store } from '../types'
import { StorePriceCard } from './StorePriceCard'

type Props = {
  /** 表示する食材名（App が確定させたもの） */
  itemName: string
  /** 店舗一覧（App が事前に読み込んで渡す） */
  stores: Store[]
  /** この食材の参考価格（あれば） */
  referencePrice?: ReferencePrice | null
}

type Loaded = {
  itemName: string
  prices: Price[]
}

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

function StorePrices({
  prices,
  stores,
  hasReference,
}: {
  prices: Price[] | null
  stores: Store[]
  hasReference: boolean
}) {
  if (prices === null) {
    return <p className="py-6 text-center text-gray-500">読み込み中…</p>
  }

  if (prices.length === 0) {
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

  // 安い順に並べ替え（元の配列は変更しないようコピーしてから sort）
  const sorted = [...prices].sort((a, b) => a.price - b.price)
  const cheapestPrice = sorted[0].price
  const cheapestIsStale = isPriceStale(sorted[0].checkedAt)

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-500">
        店舗別の価格（安い順）
      </h3>

      {cheapestIsStale && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
          いちばん安い店の価格は確認から日数がたっています。値段が変わっているかもしれません。
        </p>
      )}

      <ul className="space-y-3">
        {sorted.map((price) => {
          const store = stores.find((candidate) => candidate.id === price.storeId)
          if (!store) return null

          return (
            <StorePriceCard
              key={price.id}
              store={store}
              price={price.price}
              unit={price.unit}
              diffFromCheapest={price.price - cheapestPrice}
              isCheapest={price.price === cheapestPrice}
              checkedLabel={formatCheckedAt(price.checkedAt)}
              isStale={isPriceStale(price.checkedAt)}
              source={price.source}
            />
          )
        })}
      </ul>
    </div>
  )
}

export function PriceComparison({ itemName, stores, referencePrice }: Props) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    let isCurrent = true
    getPricesByItem(itemName).then((result) => {
      if (isCurrent) setLoaded({ itemName, prices: result })
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
        prices={prices}
        stores={stores}
        hasReference={Boolean(referencePrice)}
      />
    </section>
  )
}
