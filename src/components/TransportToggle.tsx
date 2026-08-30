// 「移動手段を選択」トグル（徒歩 / 自転車）。
// 選択中は緑背景に白文字、未選択は白背景。
// 選んだ手段は親（App）が state で持ち、各店舗カードの所要時間表示に反映される。

import type { TransportMode } from '../types'

type Props = {
  value: TransportMode
  onChange: (mode: TransportMode) => void
}

const OPTIONS: { mode: TransportMode; label: string }[] = [
  { mode: 'walk', label: '徒歩' },
  { mode: 'bike', label: '自転車' },
]

export function TransportToggle({ value, onChange }: Props) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold text-gray-500">移動手段を選択</p>
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-gray-300">
        {OPTIONS.map((option, index) => {
          const selected = option.mode === value
          return (
            <button
              key={option.mode}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.mode)}
              className={`py-2.5 text-center text-sm font-bold transition-colors ${
                index === 0 ? 'border-r border-gray-300' : ''
              } ${
                selected
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 active:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
