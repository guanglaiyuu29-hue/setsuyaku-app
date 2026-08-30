// アプリの中心画面。
// ここでは「今なにを検索しているか（query）」と「食材名・店舗の一覧」を持ち、
// 状態に応じて表示する部品を切り替えるだけ。
// データの取得はすべて src/lib/dataSource.ts 経由（App から src/data を直接見ない）。

import { useEffect, useState } from 'react'
import { ItemNameList } from './components/ItemNameList'
import { PriceComparison } from './components/PriceComparison'
import { SearchBox } from './components/SearchBox'
import { getAllItemNames, getStores } from './lib/dataSource'
import type { Store } from './types'

function App() {
  // 検索ボックスの入力文字
  const [query, setQuery] = useState('')
  // 登録されている食材名の一覧
  const [itemNames, setItemNames] = useState<string[]>([])
  // 店舗の一覧
  const [stores, setStores] = useState<Store[]>([])

  // 画面を最初に開いたとき、一覧データを読み込む
  useEffect(() => {
    getAllItemNames().then(setItemNames)
    getStores().then(setStores)
  }, [])

  const keyword = query.trim()
  // 入力とちょうど一致する食材（あればその価格比較を表示）
  const exactItem = itemNames.find((name) => name === keyword)
  // 入力を含む食材（例: "肉" → 鶏むね肉 / 豚こま肉）
  const relatedItems = itemNames.filter(
    (name) => name !== keyword && name.includes(keyword),
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto min-h-screen max-w-md bg-white px-4 pb-16 text-gray-900">
        <header className="py-5">
          <h1 className="text-xl font-bold">食材価格くらべ</h1>
          <p className="mt-1 text-sm text-gray-500">
            京都・一人暮らしの食材価格メモ（ベータ版）
          </p>
        </header>

        <SearchBox value={query} onChange={setQuery} />

        <div className="mt-6">
          {/* 1. 入力が空 → 登録食材の一覧をボタンで表示 */}
          {keyword === '' && (
            <ItemNameList
              title="登録されている食材"
              itemNames={itemNames}
              onSelect={setQuery}
            />
          )}

          {/* 2. 入力と一致する食材がある → 価格比較を表示 */}
          {keyword !== '' && exactItem && (
            <PriceComparison itemName={exactItem} stores={stores} />
          )}

          {/* 3. 一致はしないが、近い食材がある → 候補ボタンを表示 */}
          {keyword !== '' && !exactItem && relatedItems.length > 0 && (
            <ItemNameList
              title={`「${keyword}」に近い食材`}
              itemNames={relatedItems}
              onSelect={setQuery}
            />
          )}

          {/* 4. 一致も候補もない → 推測せず「未登録」と伝える */}
          {keyword !== '' && !exactItem && relatedItems.length === 0 && (
            <div className="rounded-xl bg-gray-50 p-6 text-center">
              <p className="text-lg font-semibold">
                「{keyword}」の価格はまだ登録されていません
              </p>
              <p className="mt-2 text-sm text-gray-500">
                入力した食材名が正しいか確認してください。
              </p>
            </div>
          )}
        </div>

        <footer className="mt-10 border-t border-gray-100 pt-4">
          <p className="text-xs leading-relaxed text-gray-400">
            ※価格は調査時点のものです。実際の店頭価格と異なる場合があります。
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
