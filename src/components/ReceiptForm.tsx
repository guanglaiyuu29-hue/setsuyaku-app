// レシートを手入力で投稿する画面（OCRなし版）。
//   1. レシート画像を選ぶ（Supabase Storage に保存される）
//   2. 店舗を選ぶ
//   3. 買った日を入れる
//   4. 商品を1件ずつ追加（商品名は登録済みの候補から選べる）
//   5. 「登録する」で prices テーブルに source='receipt' として保存

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  submitReceipt,
  type KnownItem,
  type ReceiptItemInput,
} from '../lib/dataSource'
import type { Store } from '../types'

/** 投稿完了後に「ありがとう画面」へ渡す内容 */
export type SubmittedSummary = {
  storeName: string
  purchasedOn: string
  itemNames: string[]
}

type Props = {
  userId: string
  stores: Store[]
  knownItems: KnownItem[]
  onCancel: () => void
  onSubmitted: (summary: SubmittedSummary) => void
}

/** フォーム上の1品目（入力途中なので価格は文字列で持つ） */
type DraftItem = {
  key: number
  itemName: string
  price: string
  unit: string
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10MB

function todayLocal(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function createEmptyItem(key: number): DraftItem {
  return { key, itemName: '', price: '', unit: '' }
}

export function ReceiptForm({
  userId,
  stores,
  knownItems,
  onCancel,
  onSubmitted,
}: Props) {
  const today = todayLocal()
  const knownUnits = [...new Set(knownItems.map((item) => item.unit))]

  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [storeId, setStoreId] = useState('')
  const [purchasedOn, setPurchasedOn] = useState(today)
  const [items, setItems] = useState<DraftItem[]>([createEmptyItem(1)])
  const [nextKey, setNextKey] = useState(2)
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // プレビュー用URLは画面から消えるときに破棄する（メモリ節約のための後片付け）
  useEffect(() => {
    if (previewUrl === '') return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  function handleImageChange(file: File | null) {
    setErrorMessage('')
    setImage(null)
    setPreviewUrl('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrorMessage('画像ファイル（写真）を選んでください。')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrorMessage('画像のサイズが大きすぎます（10MBまで）。')
      return
    }
    setImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function updateItem(key: number, patch: Partial<DraftItem>) {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    )
  }

  function handleItemNameChange(key: number, value: string) {
    const known = knownItems.find((candidate) => candidate.name === value)
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item
        const next: DraftItem = { ...item, itemName: value }
        // 既存の商品名を選んだとき、単位が空なら自動で埋める
        if (known && item.unit.trim() === '') next.unit = known.unit
        return next
      }),
    )
  }

  function addItem() {
    setItems((prev) => [...prev, createEmptyItem(nextKey)])
    setNextKey((key) => key + 1)
  }

  function removeItem(key: number) {
    setItems((prev) =>
      prev.length <= 1 ? prev : prev.filter((item) => item.key !== key),
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!image) {
      setErrorMessage('レシートの画像を選んでください。')
      return
    }
    if (storeId === '') {
      setErrorMessage('お店を選んでください。')
      return
    }
    if (purchasedOn === '') {
      setErrorMessage('買った日を入力してください。')
      return
    }
    if (purchasedOn > today) {
      setErrorMessage('買った日が未来の日付になっています。')
      return
    }

    const cleanedItems: ReceiptItemInput[] = []
    for (const item of items) {
      const name = item.itemName.trim()
      const unit = item.unit.trim()
      const priceNumber = Number(item.price)
      if (name === '' || unit === '' || item.price.trim() === '') {
        setErrorMessage('すべての品目で、商品名・価格・単位を入力してください。')
        return
      }
      if (!Number.isInteger(priceNumber) || priceNumber <= 0) {
        setErrorMessage(`「${name}」の価格は1以上の整数で入力してください。`)
        return
      }
      cleanedItems.push({ itemName: name, price: priceNumber, unit })
    }

    setBusy(true)
    try {
      const result = await submitReceipt({
        userId,
        storeId,
        purchasedOn,
        image,
        items: cleanedItems,
      })
      if (!result.ok) {
        setErrorMessage(result.message)
        return
      }
      const store = stores.find((candidate) => candidate.id === storeId)
      onSubmitted({
        storeName: store ? store.name : '選んだお店',
        purchasedOn,
        itemNames: [...new Set(cleanedItems.map((item) => item.itemName))],
      })
    } finally {
      setBusy(false)
    }
  }

  const fieldClass =
    'mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg outline-none focus:border-gray-900'

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-gray-500 underline active:text-gray-900"
      >
        ← 価格の一覧に戻る
      </button>

      <h2 className="mt-4 text-lg font-bold">レシートを投稿</h2>
      <p className="mt-1 text-sm text-gray-500">
        買い物のレシートを見ながら、商品の価格を入力してください。
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-6">
        {/* 1. レシート画像 */}
        <div>
          <label htmlFor="receipt-image" className="block text-sm font-medium">
            レシートの写真
          </label>
          <input
            id="receipt-image"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) =>
              handleImageChange(event.target.files?.[0] ?? null)
            }
            className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-white"
          />
          {previewUrl !== '' && (
            <img
              src={previewUrl}
              alt="選んだレシートのプレビュー"
              className="mt-3 max-h-56 rounded-lg border border-gray-200 object-contain"
            />
          )}
        </div>

        {/* 2. 店舗 */}
        <div>
          <label htmlFor="receipt-store" className="block text-sm font-medium">
            お店
          </label>
          <select
            id="receipt-store"
            value={storeId}
            onChange={(event) => setStoreId(event.target.value)}
            className={fieldClass}
          >
            <option value="">選んでください</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. 購入日 */}
        <div>
          <label htmlFor="receipt-date" className="block text-sm font-medium">
            買った日
          </label>
          <input
            id="receipt-date"
            type="date"
            value={purchasedOn}
            max={today}
            onChange={(event) => setPurchasedOn(event.target.value)}
            className={fieldClass}
          />
        </div>

        {/* 4. 商品 */}
        <div>
          <p className="text-sm font-medium">買ったもの</p>
          <p className="mt-1 text-xs text-gray-500">
            商品名は、できるだけ入力欄の候補から選んでください（表記をそろえるため）。
            候補に無ければ、そのまま入力してもかまいません。
          </p>

          <datalist id="known-item-names">
            {knownItems.map((known) => (
              <option key={known.name} value={known.name} />
            ))}
          </datalist>
          <datalist id="known-units">
            {knownUnits.map((unit) => (
              <option key={unit} value={unit} />
            ))}
          </datalist>

          <ul className="mt-3 space-y-4">
            {items.map((item, index) => (
              <li key={item.key} className="rounded-xl border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    {index + 1} 品目
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      className="text-xs text-gray-500 underline active:text-gray-900"
                    >
                      削除
                    </button>
                  )}
                </div>

                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    list="known-item-names"
                    placeholder="商品名（例: 卵）"
                    value={item.itemName}
                    onChange={(event) =>
                      handleItemNameChange(item.key, event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base outline-none focus:border-gray-900"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      placeholder="価格（円）"
                      value={item.price}
                      onChange={(event) =>
                        updateItem(item.key, { price: event.target.value })
                      }
                      className="w-1/2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base outline-none focus:border-gray-900"
                    />
                    <input
                      type="text"
                      list="known-units"
                      placeholder="単位（例: 1パック）"
                      value={item.unit}
                      onChange={(event) =>
                        updateItem(item.key, { unit: event.target.value })
                      }
                      className="w-1/2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base outline-none focus:border-gray-900"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={addItem}
            className="mt-3 w-full rounded-xl border border-gray-300 py-2.5 text-sm font-medium active:bg-gray-100"
          >
            ＋ 商品を追加
          </button>
        </div>

        {errorMessage !== '' && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-gray-900 py-3 text-lg font-bold text-white active:bg-gray-700 disabled:opacity-50"
        >
          {busy ? '登録中…' : '登録する'}
        </button>
      </form>
    </div>
  )
}
