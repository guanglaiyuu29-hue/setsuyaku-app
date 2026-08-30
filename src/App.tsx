// アプリの中心画面。
// 「今なにを検索しているか（query）」「食材名・店舗・参考価格の一覧」
// 「今どの画面を出しているか（screen）」「下部タブ（tab）」「移動手段（transport）」を持ち、
// 状態に応じて表示を切り替える。
// データ取得は src/lib/dataSource.ts、ログインまわりは src/lib/auth.ts 経由。

import { useEffect, useState } from 'react'
import { AuthScreen } from './components/AuthScreen'
import { BottomTabBar, type TabKey } from './components/BottomTabBar'
import { ItemNameList } from './components/ItemNameList'
import { PriceComparison } from './components/PriceComparison'
import { ReceiptForm } from './components/ReceiptForm'
import type { SubmittedSummary } from './components/ReceiptForm'
import { ReceiptThanks } from './components/ReceiptThanks'
import { ReferencePriceList } from './components/ReferencePriceList'
import { SearchBox } from './components/SearchBox'
import { TransportToggle } from './components/TransportToggle'
import { useAuth } from './context/auth-context'
import { signOut } from './lib/auth'
import {
  getAllItemNames,
  getKnownItems,
  getReferencePrices,
  getStores,
  type KnownItem,
  type ReferencePrice,
} from './lib/dataSource'
import type { Store, TransportMode } from './types'

// 表示する画面の種類。
// 'main' = 価格くらべ（ログインしていなくても見られる）
type Screen = 'main' | 'login' | 'signup' | 'receipt' | 'receipt-done'

/** 重複を除いて順序を保つ */
function unique(values: string[]): string[] {
  return [...new Set(values)]
}

/** マップ・グラフタブの中身はまだ無いので、準備中の案内だけ出す */
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-gray-300 p-8 text-center">
      <p className="text-lg font-bold text-gray-700">{title}は準備中です</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">
        近日公開予定です。いまは「価格比較」タブをご利用ください。
      </p>
    </div>
  )
}

function App() {
  // ログイン状態（アプリ全体で共有。AuthProvider が管理）
  const { user, loading: authLoading } = useAuth()

  const [screen, setScreen] = useState<Screen>('main')
  const [tab, setTab] = useState<TabKey>('compare')
  const [transport, setTransport] = useState<TransportMode>('walk')
  const [query, setQuery] = useState('')
  // prices テーブルに実売価格がある食材名
  const [itemNames, setItemNames] = useState<string[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [knownItems, setKnownItems] = useState<KnownItem[]>([])
  // 初期データ（参考価格）
  const [referencePrices, setReferencePrices] = useState<ReferencePrice[]>([])
  const [lastReceipt, setLastReceipt] = useState<SubmittedSummary | null>(null)

  useEffect(() => {
    getAllItemNames().then(setItemNames)
    getStores().then(setStores)
    getKnownItems().then(setKnownItems)
    getReferencePrices().then(setReferencePrices)
  }, [])

  // 食材名 → 参考価格 の対応表
  const referenceByName = new Map(
    referencePrices.map((item) => [item.itemName, item]),
  )
  // 検索対象になる食材名（参考価格の食材 ＋ 実売価格がある食材）
  const allItemNames = unique([
    ...referencePrices.map((item) => item.itemName),
    ...itemNames,
  ])

  const keyword = query.trim()
  const exactItem = allItemNames.find((name) => name === keyword)
  const relatedItems = allItemNames.filter(
    (name) => name !== keyword && name.includes(keyword),
  )

  async function handleLogout() {
    await signOut()
  }

  async function handleReceiptSubmitted(summary: SubmittedSummary) {
    setLastReceipt(summary)
    // 新しく増えた商品名・価格を一覧に反映させる
    const [names, known] = await Promise.all([
      getAllItemNames(),
      getKnownItems(),
    ])
    setItemNames(names)
    setKnownItems(known)
    setScreen('receipt-done')
  }

  function goToItem(itemName: string) {
    setQuery(itemName)
    setScreen('main')
    setTab('compare')
  }

  function renderMainSearch() {
    return (
      <>
        <SearchBox value={query} onChange={setQuery} />

        <div className="mt-4">
          <TransportToggle value={transport} onChange={setTransport} />
        </div>

        <div className="mt-5">
          {/* 1. 入力が空 → 参考価格の一覧を表示 */}
          {keyword === '' && (
            <ReferencePriceList items={referencePrices} onSelect={setQuery} />
          )}

          {/* 2. 入力と一致する食材がある → 価格くらべを表示 */}
          {keyword !== '' && exactItem && (
            <PriceComparison
              itemName={exactItem}
              stores={stores}
              transport={transport}
              referencePrice={referenceByName.get(exactItem) ?? null}
            />
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

        {/* レシート投稿への入口 */}
        <div className="mt-8 rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-medium">お店で見た価格を教えてください</p>
          <p className="mt-1 text-xs text-gray-500">
            レシートを投稿すると、みんなの価格情報が新しくなります。
          </p>
          <button
            type="button"
            onClick={() => setScreen(user ? 'receipt' : 'login')}
            className="mt-3 w-full rounded-xl bg-gray-900 py-3 text-base font-bold text-white active:bg-gray-700"
          >
            レシートを投稿
          </button>
          {!user && (
            <p className="mt-2 text-xs text-gray-400">
              ※投稿にはログインが必要です
            </p>
          )}
        </div>
      </>
    )
  }

  function renderBody() {
    if (screen === 'login' || screen === 'signup') {
      return (
        <AuthScreen
          mode={screen}
          onModeChange={(nextMode) => setScreen(nextMode)}
          onSuccess={() => setScreen('main')}
          onCancel={() => setScreen('main')}
        />
      )
    }

    if (screen === 'receipt') {
      if (!user) {
        return (
          <div className="mt-6 rounded-xl bg-gray-50 p-6 text-center">
            <p className="text-lg font-semibold">投稿にはログインが必要です</p>
            <p className="mt-2 text-sm text-gray-500">
              ログインすると、レシートから価格を登録できます。
            </p>
            <button
              type="button"
              onClick={() => setScreen('login')}
              className="mt-4 w-full rounded-xl bg-gray-900 py-3 text-base font-bold text-white active:bg-gray-700"
            >
              ログイン画面へ
            </button>
            <button
              type="button"
              onClick={() => setScreen('main')}
              className="mt-2 w-full py-2 text-sm text-gray-500 underline active:text-gray-900"
            >
              戻る
            </button>
          </div>
        )
      }
      return (
        <ReceiptForm
          userId={user.id}
          stores={stores}
          knownItems={knownItems}
          onCancel={() => setScreen('main')}
          onSubmitted={handleReceiptSubmitted}
        />
      )
    }

    if (screen === 'receipt-done' && lastReceipt) {
      return (
        <ReceiptThanks
          summary={lastReceipt}
          onViewItem={goToItem}
          onPostAnother={() => setScreen('receipt')}
          onHome={() => setScreen('main')}
        />
      )
    }

    // screen === 'main' → 下部タブに応じて切り替え
    if (tab === 'map') return <ComingSoon title="マップ" />
    if (tab === 'graph') return <ComingSoon title="グラフ" />
    return renderMainSearch()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto min-h-screen max-w-md bg-white px-4 pb-24 text-gray-900">
        <header className="relative flex items-center justify-center py-4">
          <h1 className="text-xl font-extrabold tracking-tight text-emerald-600">
            食材価格くらべ
          </h1>

          {/* アカウント欄：目立たないよう小さく右上に置く */}
          <div className="absolute right-0 top-1/2 max-w-[38%] -translate-y-1/2 text-right">
            {authLoading ? null : user ? (
              <>
                <p className="truncate text-[10px] leading-tight text-gray-400">
                  {user.email}
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-gray-500 underline active:text-gray-900"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setScreen('login')}
                className="text-xs text-gray-500 underline active:text-gray-900"
              >
                ログイン
              </button>
            )}
          </div>
        </header>

        {renderBody()}

        <footer className="mt-10 border-t border-gray-100 pt-4">
          <p className="text-xs leading-relaxed text-gray-400">
            ※価格は調査時点のものです。実際の店頭価格と異なる場合があります。
            初期データの参考価格には全国平均を含みます（各食材に地域を表示）。
          </p>
        </footer>
      </div>

      <BottomTabBar
        value={tab}
        onChange={(next) => {
          setTab(next)
          setScreen('main')
        }}
      />
    </div>
  )
}

export default App
