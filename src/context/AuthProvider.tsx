// ログイン状態を実際に監視して、アプリ全体に配る部品。
// main.tsx で <App /> をこの <AuthProvider> で包みます。

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. 画面を開いた時点でのログイン状態を1回だけ確認する
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setUser(data.session?.user ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // 2. そのあとのログイン／ログアウトを監視し、変化を自動で反映する
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // 画面が閉じられるときに監視を解除する（後片付け）
    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
