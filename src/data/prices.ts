// ============================================================
// ★ ここを編集すれば「価格データ」が変わります ★
//
// ・prices の [ ] の中に、価格を { } 1件ずつ並べています
//   （1件 = ある食材・ある店舗・ある日の値段）。
// ・価格を書き換える: その { } の price の数字を直すだけ。checkedAt（確認日）も直すと親切。
// ・価格を追加: 既存の { ... } を丸ごとコピーして貼り付け、中身を書き換える。
//   - 前の } の後ろに「,」カンマを付け忘れないこと
//   - id は他の行と重複しない文字列にすること（例: 末尾の番号を +1 する）
// ・価格を削除: その { ... }, を1件丸ごと消す。
//
// 【ルール】
//  1. storeId は src/data/stores.ts の id と完全に同じ文字列にすること。
//     現在使える id:
//       aeon-demachiyanagi / fresco-hyakumanben /
//       gyomu-super-kitashirakawa / life-kawabata
//  2. 同じ食材は itemName の表記をそろえること（"卵" と "たまご" を混ぜない）。
//  3. price は数字のみ（例: 258）。"258円" や "1,000" はダメ。
//  4. checkedAt は "YYYY-MM-DD"（例: "2026-08-30"）。
//  5. source は基本 "official"（運営が店で調べた価格）のまま。
//     将来レシート投稿機能ができたら "receipt" のデータが自動で増える。
//
// ※ 下の値段はすべて架空のサンプルです。実際に店で見た値段に置き換えてください。
// ============================================================

import type { Price } from '../types'

export const prices: Price[] = [
  // --- 卵（10個入り1パック） ---
  { id: 'official-001', itemName: '卵', storeId: 'aeon-demachiyanagi', price: 258, unit: '10個入り1パック', checkedAt: '2026-08-28', source: 'official' },
  { id: 'official-002', itemName: '卵', storeId: 'fresco-hyakumanben', price: 245, unit: '10個入り1パック', checkedAt: '2026-08-29', source: 'official' },
  { id: 'official-003', itemName: '卵', storeId: 'gyomu-super-kitashirakawa', price: 228, unit: '10個入り1パック', checkedAt: '2026-07-15', source: 'official' },
  { id: 'official-004', itemName: '卵', storeId: 'life-kawabata', price: 268, unit: '10個入り1パック', checkedAt: '2026-08-29', source: 'official' },

  // --- 牛乳（1000ml 1本） ---
  { id: 'official-005', itemName: '牛乳', storeId: 'aeon-demachiyanagi', price: 235, unit: '1000ml 1本', checkedAt: '2026-08-28', source: 'official' },
  { id: 'official-006', itemName: '牛乳', storeId: 'fresco-hyakumanben', price: 218, unit: '1000ml 1本', checkedAt: '2026-08-29', source: 'official' },
  { id: 'official-007', itemName: '牛乳', storeId: 'gyomu-super-kitashirakawa', price: 198, unit: '1000ml 1本', checkedAt: '2026-08-27', source: 'official' },
  { id: 'official-008', itemName: '牛乳', storeId: 'life-kawabata', price: 228, unit: '1000ml 1本', checkedAt: '2026-08-29', source: 'official' },

  // --- 食パン（6枚切り 1斤） ---
  { id: 'official-009', itemName: '食パン', storeId: 'aeon-demachiyanagi', price: 168, unit: '6枚切り 1斤', checkedAt: '2026-08-28', source: 'official' },
  { id: 'official-010', itemName: '食パン', storeId: 'fresco-hyakumanben', price: 158, unit: '6枚切り 1斤', checkedAt: '2026-08-29', source: 'official' },
  { id: 'official-011', itemName: '食パン', storeId: 'gyomu-super-kitashirakawa', price: 138, unit: '6枚切り 1斤', checkedAt: '2026-08-27', source: 'official' },
  { id: 'official-012', itemName: '食パン', storeId: 'life-kawabata', price: 178, unit: '6枚切り 1斤', checkedAt: '2026-08-29', source: 'official' },

  // --- 米（5kg 1袋） ---
  { id: 'official-013', itemName: '米（5kg）', storeId: 'aeon-demachiyanagi', price: 2680, unit: '5kg 1袋', checkedAt: '2026-08-25', source: 'official' },
  { id: 'official-014', itemName: '米（5kg）', storeId: 'fresco-hyakumanben', price: 2580, unit: '5kg 1袋', checkedAt: '2026-08-26', source: 'official' },
  { id: 'official-015', itemName: '米（5kg）', storeId: 'gyomu-super-kitashirakawa', price: 2380, unit: '5kg 1袋', checkedAt: '2026-07-10', source: 'official' },
  { id: 'official-016', itemName: '米（5kg）', storeId: 'life-kawabata', price: 2780, unit: '5kg 1袋', checkedAt: '2026-08-26', source: 'official' },

  // --- 鶏むね肉（100gあたりの値段） ---
  { id: 'official-017', itemName: '鶏むね肉', storeId: 'aeon-demachiyanagi', price: 68, unit: '100gあたり', checkedAt: '2026-08-28', source: 'official' },
  { id: 'official-018', itemName: '鶏むね肉', storeId: 'fresco-hyakumanben', price: 65, unit: '100gあたり', checkedAt: '2026-08-29', source: 'official' },
  { id: 'official-019', itemName: '鶏むね肉', storeId: 'gyomu-super-kitashirakawa', price: 58, unit: '100gあたり', checkedAt: '2026-08-27', source: 'official' },
  { id: 'official-020', itemName: '鶏むね肉', storeId: 'life-kawabata', price: 72, unit: '100gあたり', checkedAt: '2026-08-10', source: 'official' },

  // --- 豚こま肉（100gあたりの値段） ---
  { id: 'official-021', itemName: '豚こま肉', storeId: 'aeon-demachiyanagi', price: 128, unit: '100gあたり', checkedAt: '2026-08-28', source: 'official' },
  { id: 'official-022', itemName: '豚こま肉', storeId: 'fresco-hyakumanben', price: 118, unit: '100gあたり', checkedAt: '2026-08-29', source: 'official' },
  { id: 'official-023', itemName: '豚こま肉', storeId: 'gyomu-super-kitashirakawa', price: 98, unit: '100gあたり', checkedAt: '2026-08-27', source: 'official' },
  { id: 'official-024', itemName: '豚こま肉', storeId: 'life-kawabata', price: 138, unit: '100gあたり', checkedAt: '2026-08-29', source: 'official' },

  // --- キャベツ（1玉） ---
  { id: 'official-025', itemName: 'キャベツ', storeId: 'aeon-demachiyanagi', price: 198, unit: '1玉', checkedAt: '2026-08-28', source: 'official' },
  { id: 'official-026', itemName: 'キャベツ', storeId: 'fresco-hyakumanben', price: 178, unit: '1玉', checkedAt: '2026-08-29', source: 'official' },
  { id: 'official-027', itemName: 'キャベツ', storeId: 'gyomu-super-kitashirakawa', price: 148, unit: '1玉', checkedAt: '2026-08-27', source: 'official' },
  { id: 'official-028', itemName: 'キャベツ', storeId: 'life-kawabata', price: 208, unit: '1玉', checkedAt: '2026-08-29', source: 'official' },

  // --- 玉ねぎ（1個 / バラ売り） ---
  { id: 'official-029', itemName: '玉ねぎ', storeId: 'aeon-demachiyanagi', price: 68, unit: '1個（バラ売り）', checkedAt: '2026-08-28', source: 'official' },
  { id: 'official-030', itemName: '玉ねぎ', storeId: 'fresco-hyakumanben', price: 58, unit: '1個（バラ売り）', checkedAt: '2026-08-29', source: 'official' },
  { id: 'official-031', itemName: '玉ねぎ', storeId: 'gyomu-super-kitashirakawa', price: 45, unit: '1個（バラ売り）', checkedAt: '2026-08-27', source: 'official' },
  { id: 'official-032', itemName: '玉ねぎ', storeId: 'life-kawabata', price: 65, unit: '1個（バラ売り）', checkedAt: '2026-08-29', source: 'official' },

  // --- にんじん（1本 / バラ売り） ---
  { id: 'official-033', itemName: 'にんじん', storeId: 'aeon-demachiyanagi', price: 48, unit: '1本（バラ売り）', checkedAt: '2026-08-28', source: 'official' },
  { id: 'official-034', itemName: 'にんじん', storeId: 'fresco-hyakumanben', price: 42, unit: '1本（バラ売り）', checkedAt: '2026-08-29', source: 'official' },
  { id: 'official-035', itemName: 'にんじん', storeId: 'gyomu-super-kitashirakawa', price: 33, unit: '1本（バラ売り）', checkedAt: '2026-08-27', source: 'official' },
  { id: 'official-036', itemName: 'にんじん', storeId: 'life-kawabata', price: 52, unit: '1本（バラ売り）', checkedAt: '2026-08-29', source: 'official' },

  // --- もやし（200g 1袋） ---
  { id: 'official-037', itemName: 'もやし', storeId: 'aeon-demachiyanagi', price: 38, unit: '200g 1袋', checkedAt: '2026-08-28', source: 'official' },
  { id: 'official-038', itemName: 'もやし', storeId: 'fresco-hyakumanben', price: 33, unit: '200g 1袋', checkedAt: '2026-08-29', source: 'official' },
  { id: 'official-039', itemName: 'もやし', storeId: 'gyomu-super-kitashirakawa', price: 19, unit: '200g 1袋', checkedAt: '2026-08-05', source: 'official' },
  { id: 'official-040', itemName: 'もやし', storeId: 'life-kawabata', price: 39, unit: '200g 1袋', checkedAt: '2026-08-29', source: 'official' },

  // --- 豆腐（300g 1丁） ---
  { id: 'official-041', itemName: '豆腐', storeId: 'aeon-demachiyanagi', price: 58, unit: '300g 1丁', checkedAt: '2026-08-28', source: 'official' },
  { id: 'official-042', itemName: '豆腐', storeId: 'fresco-hyakumanben', price: 52, unit: '300g 1丁', checkedAt: '2026-08-29', source: 'official' },
  { id: 'official-043', itemName: '豆腐', storeId: 'gyomu-super-kitashirakawa', price: 39, unit: '300g 1丁', checkedAt: '2026-08-27', source: 'official' },
  { id: 'official-044', itemName: '豆腐', storeId: 'life-kawabata', price: 62, unit: '300g 1丁', checkedAt: '2026-08-29', source: 'official' },

  // --- 納豆（3パック 1セット） ---
  { id: 'official-045', itemName: '納豆', storeId: 'aeon-demachiyanagi', price: 98, unit: '3パック 1セット', checkedAt: '2026-08-28', source: 'official' },
  { id: 'official-046', itemName: '納豆', storeId: 'fresco-hyakumanben', price: 88, unit: '3パック 1セット', checkedAt: '2026-08-29', source: 'official' },
  { id: 'official-047', itemName: '納豆', storeId: 'gyomu-super-kitashirakawa', price: 68, unit: '3パック 1セット', checkedAt: '2026-08-27', source: 'official' },
  { id: 'official-048', itemName: '納豆', storeId: 'life-kawabata', price: 108, unit: '3パック 1セット', checkedAt: '2026-08-29', source: 'official' },
]
