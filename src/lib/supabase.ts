// ============================================================
// Supabase（クラウドのデータベース）への「接続」を1か所で作る場所。
//
// ここで作った supabase を、dataSource.ts / auth.ts から使います。
// 接続情報（URL と anon キー）は .env（ローカル）や公開先の環境変数から読みます。
// 名前が VITE_ で始まる変数だけがアプリから読める、という Vite の決まりがあります。
//
// ■ 接続情報が無いとき
//   以前はここで throw（エラーで停止）していたため、環境変数の設定ミスで
//   「画面が真っ白」になっていました。
//   今は throw せず、isSupabaseConfigured を false にして返します。
//   main.tsx がそれを見て「設定エラー画面（ConfigError）」を表示します。
// ============================================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * 接続情報（URL と anon キー）が両方そろっているか。
 * false のとき ＝ .env または公開先の環境変数が未設定。
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// 未設定でも createClient がエラーを投げないよう、形式だけ正しいダミー値を渡す。
// （未設定時は main.tsx が先に画面をブロックするので、この接続は実際には使われない）
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
)
