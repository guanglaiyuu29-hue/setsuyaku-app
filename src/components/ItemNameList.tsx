// 食材名をボタンで並べる部品。
// ・検索ボックスが空のとき → 登録食材の一覧として表示
// ・入力に近い食材が複数あるとき → 候補として表示
// ボタンを押すと、その食材名で検索した状態になる（onSelect で親に伝える）。

type Props = {
  /** 見出し文（例: "登録されている食材"） */
  title: string
  /** 表示する食材名の配列 */
  itemNames: string[]
  /** ボタンが押されたとき、その食材名を親に伝える関数 */
  onSelect: (itemName: string) => void
}

export function ItemNameList({ title, itemNames, onSelect }: Props) {
  if (itemNames.length === 0) {
    return <p className="text-base text-gray-500">食材がまだ登録されていません。</p>
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500">{title}</h2>
      <ul className="flex flex-wrap gap-2">
        {itemNames.map((name) => (
          <li key={name}>
            <button
              type="button"
              onClick={() => onSelect(name)}
              className="rounded-full border border-gray-300 bg-white px-4 py-2.5 text-base active:bg-gray-100"
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
