// ============================================================
// 【認証（ログイン）まわりの処理】をここ1か所にまとめています。
//
// 画面側はこのファイルの関数だけを呼び、supabase.auth を直接は触りません
// （データ取得を dataSource.ts にまとめているのと同じ考え方）。
//
//   ・signUp  … 新規登録
//   ・signIn  … ログイン
//   ・signOut … ログアウト
//
// Supabase が返すエラーは英語なので、日本語の短い文に言い換えて返します。
// ============================================================

import { supabase } from './supabase'

/** Supabase の英語エラーを、利用者向けの日本語メッセージに変換する */
function toJapaneseMessage(raw: string): string {
  const text = raw.toLowerCase()
  if (text.includes('invalid login credentials')) {
    return 'メールアドレスかパスワードが正しくありません。'
  }
  if (text.includes('already registered') || text.includes('already been registered')) {
    return 'このメールアドレスはすでに登録されています。ログインしてください。'
  }
  if (text.includes('password should be at least')) {
    return 'パスワードは6文字以上で入力してください。'
  }
  if (text.includes('unable to validate email address') || text.includes('invalid format')) {
    return 'メールアドレスの形式が正しくありません。'
  }
  if (text.includes('email not confirmed')) {
    return '確認メールのリンクがまだ開かれていません。届いたメールを確認してください。'
  }
  if (text.includes('for security purposes') || text.includes('rate limit')) {
    return '短時間に試しすぎました。少し時間をおいてからもう一度お試しください。'
  }
  return `エラーが発生しました：${raw}`
}

/** ログイン／ログアウトの結果（成功か、失敗＋日本語メッセージか） */
export type AuthResult = { ok: true } | { ok: false; message: string }

/** 新規登録の結果 */
export type SignUpOutcome =
  | { status: 'signed-in' } // 登録と同時にログインまで完了した
  | { status: 'needs-email-confirm' } // 確認メールの承認待ち
  | { status: 'error'; message: string }

/** 新規登録する */
export async function signUp(
  email: string,
  password: string,
): Promise<SignUpOutcome> {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { status: 'error', message: toJapaneseMessage(error.message) }
  // Supabase 側の設定で「メール確認」が ON だと、この時点では session は null。
  if (data.session) return { status: 'signed-in' }
  return { status: 'needs-email-confirm' }
}

/** ログインする */
export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { ok: false, message: toJapaneseMessage(error.message) }
  return { ok: true }
}

/** ログアウトする */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}
