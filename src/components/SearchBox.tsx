// 上部の検索ボックス。入力した文字は「親（App）」が state で持つので、
// ここは「表示」と「入力されたら親に伝える」だけを担当する。

type Props = {
  /** 現在の入力文字（親から渡される） */
  value: string
  /** 入力が変わったとき親に知らせる関数 */
  onChange: (value: string) => void
}

export function SearchBox({ value, onChange }: Props) {
  return (
    <div className="relative">
      <input
        type="text"
        inputMode="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="食材名を入力（例: 卵）"
        aria-label="食材名で検索"
        className="w-full rounded-xl border border-gray-300 bg-white py-3 pr-16 pl-4 text-lg outline-none focus:border-gray-900"
      />
      {value !== '' && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="入力を消す"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg px-3 py-2 text-base text-gray-500 active:bg-gray-100"
        >
          消す
        </button>
      )}
    </div>
  )
}
