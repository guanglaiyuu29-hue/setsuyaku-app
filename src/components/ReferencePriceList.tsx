// 初期データ（参考価格）の一覧。検索ボックスが空のときに表示する。
//   ・「参考価格（概算）」であることを明示する
//   ・地域（全国平均など）と調査時期を必ず表示する
//   ・根拠が弱いもの（needs_review）は金額を出さず「価格確認中」と表示
//   ・ユーザーが投稿したレシート価格（prices テーブル）とは別物

import type { ReferencePrice } from '../lib/dataSource'

type Props = {
  items: ReferencePrice[]
  onSelect: (itemName: string) => void
}

/** "全国" → "全国平均"、"2026年7月" を付けた地域・時期の表示文 */
function regionLine(item: ReferencePrice): string {
  const parts: string[] = []
  if (item.region) parts.push(item.region === '全国' ? '全国平均' : item.region)
  if (item.surveyDate) parts.push(item.surveyDate)
  return parts.join('・')
}

/** 分類ごとにまとめる（出てきた順を保つ） */
function groupByCategory(items: ReferencePrice[]): [string, ReferencePrice[]][] {
  const groups = new Map<string, ReferencePrice[]>()
  for (const item of items) {
    const list = groups.get(item.category)
    if (list) list.push(item)
    else groups.set(item.category, [item])
  }
  return [...groups.entries()]
}

export function ReferencePriceList({ items, onSelect }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-base text-gray-500">
        食材がまだ登録されていません。
      </p>
    )
  }

  return (
    <div>
      <div className="rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
        下記は<span className="font-semibold text-gray-700">参考価格（概算）</span>です。
        店舗・地域・時期によって実際の価格は変わります。
        利用者が投稿したレシートの価格は、食材を選ぶと別に表示されます。
      </div>

      {groupByCategory(items).map(([category, groupItems]) => (
        <section key={category} className="mt-5">
          <h2 className="mb-2 text-sm font-semibold text-gray-500">{category}</h2>
          <ul className="space-y-2">
            {groupItems.map((item) => {
              const hasPrice =
                item.priceStatus !== 'needs_review' &&
                item.referencePrice !== null
              const line = regionLine(item)

              return (
                <li
                  key={item.itemName}
                  className="rounded-xl border border-gray-200 p-3"
                >
                  <button
                    type="button"
                    onClick={() => onSelect(item.itemName)}
                    className="w-full text-left active:opacity-70"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{item.itemName}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{item.unit}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        {hasPrice ? (
                          <p className="text-xl font-bold tabular-nums">
                            約{item.referencePrice?.toLocaleString()}
                            <span className="ml-0.5 text-sm font-semibold">円</span>
                          </p>
                        ) : (
                          <p className="text-sm font-medium text-gray-400">
                            価格確認中
                          </p>
                        )}
                        {line !== '' && (
                          <p className="mt-0.5 text-xs text-gray-400">{line}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        参考価格
                      </span>
                      {item.priceStatus === 'estimated' && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          概算
                        </span>
                      )}
                      {item.priceStatus === 'needs_review' && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                          要確認
                        </span>
                      )}
                    </div>
                  </button>

                  {item.sourceName && (
                    <p className="mt-2 border-t border-gray-100 pt-2 text-xs text-gray-400">
                      出典：
                      {item.sourceUrl ? (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          {item.sourceName}
                        </a>
                      ) : (
                        item.sourceName
                      )}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
