// ============================================================
// ★ ここを編集すれば「店舗リスト」が変わります ★
//
// ・stores の [ ] の中に、店舗を { } 単位で並べています。
// ・店舗を追加: 既存の { ... } を丸ごとコピーして貼り付け、中身を書き換える。
//   （前の } の後ろに「,」カンマを付けるのを忘れずに）
// ・店舗を削除: その { ... }, を1つ丸ごと消す。
// ・各項目の意味は src/types/index.ts のコメントを参照。
//
// 【重要】id は他のファイル（prices.ts）から店舗を指す「合言葉」です。
//         一度決めたら安易に変えないこと。変えるなら prices.ts も直す必要あり。
// ============================================================

import type { Store } from '../types'

export const stores: Store[] = [
  {
    id: 'aeon-demachiyanagi',
    name: 'イオン 出町柳店',
    walkMinutes: 12,
    bikeMinutes: 5,
    note: 'レジ袋は有料（3円）。深夜0時まで営業',
  },
  {
    id: 'fresco-hyakumanben',
    name: 'フレスコ 百万遍店',
    walkMinutes: 6,
    bikeMinutes: 3,
    note: '大学に一番近い。夕方は混雑しやすい',
  },
  {
    id: 'gyomu-super-kitashirakawa',
    name: '業務スーパー 北白川店',
    walkMinutes: 20,
    bikeMinutes: 8,
    note: 'まとめ買い向きで安い。品ぞろえは日によって変動',
  },
  {
    id: 'life-kawabata',
    name: 'ライフ 川端店',
    walkMinutes: 15,
    bikeMinutes: 7,
    note: '品質重視。20時以降は総菜が値引き',
  },
]
