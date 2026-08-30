// 画面下部のタブバー。価格比較 / マップ / グラフ の3つ。
// 選択中のタブは緑。マップ・グラフの中身はまだ無く、タブだけ用意している。

import type { ReactNode } from 'react'

export type TabKey = 'compare' | 'map' | 'graph'

type Props = {
  value: TabKey
  onChange: (tab: TabKey) => void
}

const TABS: { key: TabKey; label: string; icon: ReactNode }[] = [
  {
    key: 'compare',
    label: '価格比較',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M12 3v18M7 7h10M6 7l-3 6a3 3 0 0 0 6 0zM18 7l-3 6a3 3 0 0 0 6 0z" />
      </svg>
    ),
  },
  {
    key: 'map',
    label: 'マップ',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    key: 'graph',
    label: 'グラフ',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M4 5v14h16M8 15v-3M13 15V9M18 15v-6" />
      </svg>
    ),
  },
]

export function BottomTabBar({ value, onChange }: Props) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const selected = tab.key === value
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              aria-current={selected ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-bold ${
                selected ? 'text-emerald-600' : 'text-gray-400'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
