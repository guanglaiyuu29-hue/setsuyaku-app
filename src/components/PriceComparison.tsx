// 選ばれた食材の価格を「安い順」に並べて表示する部品。
//
// ・データは dataSource.getPricesByItem() からもらう（ファイルかDBかは気にしない）
// ・データが1件も無ければ、値段を推測せず「まだ登録されていません」と出す

import { useEffect, useState } from 'react'
import { formatCheckedAt, isPriceStale } from '../lib/date'
import { getPricesByItem } from '../lib/dataSource'
import type { Price, Store } from '../types'
import { StorePriceCard } from './StorePriceCard'

type Props = {
  /** 表示する食材名（App が確定させたもの） */
  itemName: string
  /** 店舗一覧（App が事前に読み込んで渡す） */
  stores: Store[]
}

// 「どの食材の結果か」を一緒に覚えておく。
// こうすると「今見たい食材」と「読み込み済みの食材」が一致するかを
// 描画時に判定でき、読み込み中かどうかが分かる。
type Loaded = {
  itemName: string
  prices: Price[]
}

export function PriceComparison({ itemName, stores }: Props) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    let isCurrent = true
    getPricesByItem(itemName).then((result) => {
      if (isCurrent) setLoaded({ itemName, prices: result })
    })
    // 途中で食材が切り替わったら、古い結果を捨てる
    return () => {
      isCurrent = false
    }
  }, [itemName])

  // 読み込み済みデータが「今見たい食材」のものでなければ、まだ読み込み中
  const prices = loaded && loaded.itemName === itemName ? loaded.prices : null

  if (prices === null) {
    return <p className="py-6 text-center text-gray-500">読み込み中…</p>
  }

  if (prices.length === 0) {
    return (
      <div className="rounded-xl bg-gray-50 p-6 text-center">
        <p className="text-lg font-semibold">「{itemName}」の価格はまだ登録されていません</p>
        <p className="mt-2 text-sm text-gray-500">
          データがそろったら、ここに店舗ごとの価格が安い順で表示されます。
        </p>
      </div>
    )
  }

  // 安い順に並べ替え（元の配列は変更しないようコピーしてから sort）
  const sorted = [...prices].sort((a, b) => a.price - b.price)
  const cheapestPrice = sorted[0].price
  // 最安の価格が「古い可能性あり」なら、遠くの店へ行く前に念押しする
  const cheapestIsStale = isPriceStale(sorted[0].checkedAt)

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">「{itemName}」の価格（安い順）</h2>

      {cheapestIsStale && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
          いちばん安い店の価格は確認から日数がたっています。値段が変わっているかもしれません。
        </p>
      )}

      <ul className="space-y-3">
        {sorted.map((price) => {
          const store = stores.find((candidate) => candidate.id === price.storeId)
          // 対応する店舗が見つからないデータは表示しない（storeId の打ち間違いなど）
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
            />
          )
        })}
      </ul>
    </section>
  )
}
