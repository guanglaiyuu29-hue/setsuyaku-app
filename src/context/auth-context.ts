// ============================================================
// ログイン状態を「アプリのどこからでも読めるようにする」仕組み（React Context）。
//
// ■ Context（コンテキスト）とは
//   ふつう、親から子へデータを渡すには props を1段ずつ手渡しします。
//   Context を使うと、途中を飛ばして「どの部品からでも」同じ値を読めます。
//   ログイン中のユーザーのように、あちこちで必要になる情報に向いています。
//
// このファイルは「入れ物（AuthContext）」と「取り出す関数（useAuth）」だけを定義。
// 実際に値を入れるのは AuthProvider.tsx です。
// ============================================================

import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'

export type AuthState = {
  /** ログイン中のユーザー。未ログインなら null */
  user: User | null
  /** 最初のログイン状態チェックが終わるまで true（この間は表示を保留する） */
  loading: boolean
}

export const AuthContext = createContext<AuthState>({ user: null, loading: true })

/** 部品の中で「今ログインしているか」を知りたいときに呼ぶ */
export function useAuth(): AuthState {
  return useContext(AuthContext)
}
