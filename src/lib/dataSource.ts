// ============================================================
// 【データアクセス層】データの「取ってくる・書き込む処理」をここ1か所にまとめています。
//
// 画面（コンポーネント）側は、このファイルの関数だけを呼んでください。
// 直接 src/data/*.ts や supabase を import しないこと。
//
// ■ 列名の違いについて
//   DB の列名は item_name / store_id のような snake_case（アンダースコア区切り）、
//   画面側で使う型は itemName / storeId のような camelCase です。
//   その変換（詰め替え）を、この層の toStore() / toPrice() で行います。
// ============================================================

import type { Price, Store } from '../types'
import { supabase } from './supabase'

// --- Supabase から返ってくる「1行」の形（列名は snake_case） ---
type StoreRow = {
  id: string
  name: string
  walk_minutes: number
  bike_minutes: number
  note: string | null
}

type PriceRow = {
  id: number
  item_name: string
  store_id: string
  price: number
  unit: string
  checked_at: string
  created_at: string
  source: string
}

// --- DB の行 → 画面用の型 への詰め替え ---
function toStore(row: StoreRow): Store {
  return {
    id: row.id,
    name: row.name,
    walkMinutes: row.walk_minutes,
    bikeMinutes: row.bike_minutes,
    note: row.note ?? '',
  }
}

function toPrice(row: PriceRow): Price {
  return {
    id: String(row.id),
    itemName: row.item_name,
    storeId: row.store_id,
    price: row.price,
    unit: row.unit,
    checkedAt: row.checked_at,
    source: row.source === 'receipt' ? 'receipt' : 'official',
  }
}

/** 店舗一覧をすべて返す */
export async function getStores(): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('id, name, walk_minutes, bike_minutes, note')
    .order('id')

  if (error) throw new Error(`店舗データの取得に失敗しました: ${error.message}`)

  return ((data as StoreRow[] | null) ?? []).map(toStore)
}

/**
 * 指定した食材名の価格一覧を返す。
 *
 * DB には過去の価格も履歴としてすべて残っているため、
 * ここで「店舗ごとに、いちばん新しい1件だけ」に絞り込んで返します。
 * （画面側は今までどおり、受け取った配列を安い順に並べるだけ）
 *
 * @param itemName 食材名（例: "卵"）。DB の item_name と完全一致で絞り込む。
 * @returns 店舗ごとの最新価格の配列（無ければ空配列 []）
 */
export async function getPricesByItem(itemName: string): Promise<Price[]> {
  const { data, error } = await supabase
    .from('prices')
    .select('id, item_name, store_id, price, unit, checked_at, created_at, source')
    .eq('item_name', itemName)
    .order('checked_at', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error(`価格データの取得に失敗しました: ${error.message}`)

  const rows = (data as PriceRow[] | null) ?? []

  // 「確認日が新しい順」で並んでいるので、
  // 店舗ごとに最初に出てきた1件（＝最新）だけを採用する。
  const latestByStore = new Map<string, Price>()
  for (const row of rows) {
    if (!latestByStore.has(row.store_id)) {
      latestByStore.set(row.store_id, toPrice(row))
    }
  }
  return [...latestByStore.values()]
}

/**
 * 登録されている食材名の一覧を返す（重複なし）。
 */
export async function getAllItemNames(): Promise<string[]> {
  const { data, error } = await supabase
    .from('prices')
    .select('item_name')
    .order('id')

  if (error) throw new Error(`食材名の取得に失敗しました: ${error.message}`)

  const rows = (data as { item_name: string }[] | null) ?? []
  const seen = new Set<string>()
  const names: string[] = []
  for (const row of rows) {
    if (!seen.has(row.item_name)) {
      seen.add(row.item_name)
      names.push(row.item_name)
    }
  }
  return names
}

// ============================================================
// レシート投稿（source: 'receipt'）
// ============================================================

/** すでに登録されている食材（名前 + 代表的な単位） */
export type KnownItem = { name: string; unit: string }

/**
 * すでに登録されている食材を「名前 + 代表的な単位」で返す。
 * レシート投稿フォームでの「商品名の候補表示」「単位の自動入力」に使う。
 * （表記ゆれを防ぐため、投稿者にはできるだけこの候補から選んでもらう）
 */
export async function getKnownItems(): Promise<KnownItem[]> {
  const { data, error } = await supabase
    .from('prices')
    .select('item_name, unit, checked_at')
    .order('checked_at', { ascending: false })

  if (error) throw new Error(`商品名リストの取得に失敗しました: ${error.message}`)

  const rows = (data as { item_name: string; unit: string }[] | null) ?? []
  const unitByName = new Map<string, string>()
  for (const row of rows) {
    if (!unitByName.has(row.item_name)) unitByName.set(row.item_name, row.unit)
  }
  return [...unitByName.entries()]
    .map(([name, unit]) => ({ name, unit }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ja'))
}

/** レシート投稿の1品目ぶんの入力 */
export type ReceiptItemInput = {
  itemName: string
  price: number
  unit: string
}

/** レシート投稿の全体の入力 */
export type SubmitReceiptInput = {
  userId: string
  storeId: string
  purchasedOn: string // "YYYY-MM-DD"
  image: File
  items: ReceiptItemInput[]
}

export type SubmitReceiptResult = { ok: true } | { ok: false; message: string }

/**
 * レシート投稿を保存する。
 *   1. レシート画像を Supabase Storage（receipts バケット）にアップロード
 *   2. 商品ごとに prices テーブルへ1行ずつ追加（source: 'receipt'）
 * 途中で失敗したら、アップロード済みの画像を削除してエラー内容を返す。
 */
export async function submitReceipt(
  input: SubmitReceiptInput,
): Promise<SubmitReceiptResult> {
  const { userId, storeId, purchasedOn, image, items } = input

  if (items.length === 0) {
    return { ok: false, message: '商品が1件も入力されていません。' }
  }

  // 1. 画像アップロード（保存先パスは「ユーザーID/時刻.拡張子」）
  const extension = image.name.split('.').pop()?.toLowerCase() || 'jpg'
  const imagePath = `${userId}/${Date.now()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(imagePath, image, { contentType: image.type || undefined })

  if (uploadError) {
    return {
      ok: false,
      message: `画像のアップロードに失敗しました: ${uploadError.message}`,
    }
  }

  // 2. prices へ商品ごとに1行ずつ追加
  const rows = items.map((item) => ({
    item_name: item.itemName,
    store_id: storeId,
    price: item.price,
    unit: item.unit,
    checked_at: purchasedOn,
    source: 'receipt',
    user_id: userId,
    receipt_image_path: imagePath,
  }))

  const { error: insertError } = await supabase.from('prices').insert(rows)

  if (insertError) {
    // 後始末：アップロードした画像を消しておく
    await supabase.storage.from('receipts').remove([imagePath])
    return {
      ok: false,
      message: `価格の保存に失敗しました: ${insertError.message}`,
    }
  }

  return { ok: true }
}
