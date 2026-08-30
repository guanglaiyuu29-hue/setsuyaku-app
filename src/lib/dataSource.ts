// ============================================================
// 【データアクセス層】データの「取ってくる処理」をここ1か所にまとめています。
//
// 画面（コンポーネント）側は、このファイルの関数だけを呼んでください。
// 直接 src/data/*.ts を import しないこと。
//
// ■ なぜこう分けるのか
//   今はデータをアプリ内のファイル（src/data/）から読んでいます。
//   将来はレシート投稿に対応するため、Supabase（クラウドのデータベース）に
//   差し替える予定です。そのとき「このファイルの中身」だけを書き換えれば、
//   画面側のコードは一切直さずに済みます。
//
// ■ 関数がすべて async（Promise を返す）なのはなぜか
//   データベースへの問い合わせは「通信」なので結果が返るまで時間がかかります。
//   今のファイル読み込みは一瞬ですが、あらかじめ async にしておくことで、
//   DB に変えても画面側の呼び方（await で待つ）が変わりません。
//
// ■ 将来 Supabase に変えるときのイメージ（今はやらない）
//   export async function getStores(): Promise<Store[]> {
//     const { data } = await supabase.from('stores').select('*')
//     return data ?? []
//   }
// ============================================================

import type { Price, Store } from '../types'
import { prices } from '../data/prices'
import { stores } from '../data/stores'

/** 店舗一覧をすべて返す */
export async function getStores(): Promise<Store[]> {
  return stores
}

/**
 * 指定した食材名の価格一覧を返す。
 * @param itemName 食材名（例: "卵"）。prices.ts の itemName と完全一致で絞り込む。
 * @returns 一致する価格レコードの配列（無ければ空配列 []）
 */
export async function getPricesByItem(itemName: string): Promise<Price[]> {
  return prices.filter((price) => price.itemName === itemName)
}

/**
 * 登録されている食材名の一覧を返す（重複なし）。
 * 並び順は prices.ts に最初に登場した順。
 */
export async function getAllItemNames(): Promise<string[]> {
  const seen = new Set<string>()
  const names: string[] = []
  for (const price of prices) {
    if (!seen.has(price.itemName)) {
      seen.add(price.itemName)
      names.push(price.itemName)
    }
  }
  return names
}
