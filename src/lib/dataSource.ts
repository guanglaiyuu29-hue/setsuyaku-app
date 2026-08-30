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

import type { Price, PriceSource, Store } from '../types'
import { supabase } from './supabase'

// --- Supabase から返ってくる「1行」の形（列名は snake_case） ---
type StoreRow = {
  id: string
  name: string
  walk_minutes: number
  bike_minutes: number
  note: string | null
  // 緯度経度は add_store_coords.sql 実行後にだけ存在する列。未実行なら undefined。
  lat?: number | null
  lng?: number | null
}

type PriceRow = {
  id: number
  item_name: string
  store_id: string
  price: number
  unit: string
  checked_at: string
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
    lat: typeof row.lat === 'number' ? row.lat : null,
    lng: typeof row.lng === 'number' ? row.lng : null,
  }
}

function toPriceSource(raw: string): PriceSource {
  if (raw === 'receipt' || raw === 'sample') return raw
  return 'official'
}

function toPrice(row: PriceRow): Price {
  return {
    id: String(row.id),
    itemName: row.item_name,
    storeId: row.store_id,
    price: row.price,
    unit: row.unit,
    checkedAt: row.checked_at,
    source: toPriceSource(row.source),
  }
}

/** 店舗一覧をすべて返す */
export async function getStores(): Promise<Store[]> {
  // select('*') にしておくと、緯度経度カラム（add_store_coords.sql）が
  // 未追加でもエラーにならず、追加後は自動で lat/lng も取れる。
  const { data, error } = await supabase.from('stores').select('*').order('id')

  if (error) {
    console.warn('店舗データの取得に失敗しました:', error.message)
    return []
  }

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
    .select('id, item_name, store_id, price, unit, checked_at, source')
    .eq('item_name', itemName)
    .order('checked_at', { ascending: false })

  if (error) {
    // 画面を「読み込み中…」で固めないよう、失敗しても空配列を返す
    console.warn('価格データの取得に失敗しました:', error.message)
    return []
  }

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

  if (error) {
    console.warn('食材名の取得に失敗しました:', error.message)
    return []
  }

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

  if (error) {
    console.warn('商品名リストの取得に失敗しました:', error.message)
    return []
  }

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

// ============================================================
// 参考価格（初期データ。reference_prices テーブル）
//   ・店舗別の実売価格（prices）とは別物。「概算・参考価格」として表示する。
//   ・price_status で確度を区別する。
// ============================================================

/**
 * 参考価格の確度。
 *   confirmed    … 公的統計そのもの／単純な単位換算
 *   estimated    … 近い品目や民間調査から妥当と判断した概算
 *   needs_review … 十分な根拠がなく、価格を表示しない（「価格確認中」と出す）
 */
export type ReferencePriceStatus = 'confirmed' | 'estimated' | 'needs_review'

export type ReferencePrice = {
  itemName: string
  category: string
  unit: string
  /** 参考価格（円）。needs_review のときは null */
  referencePrice: number | null
  priceStatus: ReferencePriceStatus
  /** "全国" / "近畿" / "京都市" など。不明なら null */
  region: string | null
  /** "2026年7月" など */
  surveyDate: string | null
  sourceName: string | null
  sourceUrl: string | null
  note: string | null
}

type ReferenceRow = {
  item_name: string
  category: string
  unit: string
  reference_price: number | null
  price_status: string
  region: string | null
  survey_date: string | null
  source_name: string | null
  source_url: string | null
  note: string | null
}

function toReferencePriceStatus(raw: string): ReferencePriceStatus {
  if (raw === 'confirmed' || raw === 'estimated') return raw
  return 'needs_review'
}

/**
 * 参考価格の一覧を返す（分類→食材名の順）。
 * reference_prices テーブルが無い場合は空配列を返す（アプリは落とさない）。
 */
export async function getReferencePrices(): Promise<ReferencePrice[]> {
  const { data, error } = await supabase
    .from('reference_prices')
    .select(
      'item_name, category, unit, reference_price, price_status, region, survey_date, source_name, source_url, note',
    )
    .order('category')
    .order('item_name')

  if (error) {
    // テーブル未作成などでも画面を止めない
    console.warn('参考価格の取得に失敗しました:', error.message)
    return []
  }

  const rows = (data as ReferenceRow[] | null) ?? []
  return rows.map((row) => ({
    itemName: row.item_name,
    category: row.category,
    unit: row.unit,
    referencePrice: row.reference_price,
    priceStatus: toReferencePriceStatus(row.price_status),
    region: row.region,
    surveyDate: row.survey_date,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    note: row.note,
  }))
}
