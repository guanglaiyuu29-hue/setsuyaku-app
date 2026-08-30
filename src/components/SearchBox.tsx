// 上部の検索ボックス。入力した文字は「親（App）」が state で持つので、
// ここは「表示」と「入力されたら親に伝える」だけを担当する。
// 左に虫眼鏡アイコン、右端に入力を消す × ボタンを置く。

type Props = {
  /** 現在の入力文字（親から渡される） */
  value: string
  /** 入力が変わったとき親に知らせる関数 */
  onChange: (value: string) => void
}

export function SearchBox({ value, onChange }: Props) {
  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="h-5 w-5"
        >
          <circle cx="9" cy="9" r="5.5" />
          <path d="m13.5 13.5 3.5 3.5" />
        </svg>
      </span>

      <input
        type="text"
        inputMode="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="食材名を入力（例: 卵）"
        aria-label="食材名で検索"
        className="w-full rounded-full border border-gray-300 bg-white py-3 pr-12 pl-11 text-lg outline-none focus:border-emerald-600"
      />

      {value !== '' && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="入力を消す"
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-gray-100 text-gray-500 active:bg-gray-200"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            className="h-4 w-4"
          >
            <path d="m6 6 8 8M14 6l-8 8" />
          </svg>
        </button>
      )}
    </div>
  )
}
