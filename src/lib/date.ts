// 日付まわりの小さな計算をまとめたファイル。

/**
 * 価格が「古い」とみなすまでの日数。
 * これ以上経過した価格には、画面上で注意表示を付ける。
 * 期間を変えたいときはこの数字だけ直せばよい。
 */
export const STALE_AFTER_DAYS = 14

/**
 * 確認日から今日までの経過日数を返す。
 * @param checkedAt "YYYY-MM-DD" 形式の日付文字列
 * @param now       今日の日付。省略時は実行時点の「今」。テスト用に差し替え可能。
 * @returns 経過日数（0以上の整数）。日付が不正なら NaN。
 */
export function getAgeInDays(checkedAt: string, now: Date = new Date()): number {
  const checked = new Date(`${checkedAt}T00:00:00`)
  // 時刻を切り捨てて「日付だけ」で引き算する
  const checkedDay = new Date(checked.getFullYear(), checked.getMonth(), checked.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const oneDayMs = 1000 * 60 * 60 * 24
  return Math.round((today.getTime() - checkedDay.getTime()) / oneDayMs)
}

/**
 * その価格が「古い可能性あり」かどうか。
 * 確認から STALE_AFTER_DAYS 日以上たっていれば true。
 */
export function isPriceStale(checkedAt: string, now: Date = new Date()): boolean {
  const age = getAgeInDays(checkedAt, now)
  if (Number.isNaN(age)) return false
  return age >= STALE_AFTER_DAYS
}

/**
 * 「その価格をいつ確認したか」を人間向けの文字にする。
 * 例: "3日前に確認" / "昨日確認" / "今日確認"
 */
export function formatCheckedAt(checkedAt: string, now: Date = new Date()): string {
  const diffDays = getAgeInDays(checkedAt, now)

  if (Number.isNaN(diffDays)) return '確認日不明'
  if (diffDays <= 0) return '今日確認'
  if (diffDays === 1) return '昨日確認'
  return `${diffDays}日前に確認`
}
