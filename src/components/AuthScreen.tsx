// ログイン画面と新規登録画面。
// mode で「login（ログイン）」「signup（新規登録）」を切り替える。
// 見た目と入力欄はほぼ同じなので、1つの部品にまとめている。

import { useState } from 'react'
import type { FormEvent } from 'react'
import { signIn, signUp } from '../lib/auth'

type Props = {
  /** 'login' = ログイン画面 / 'signup' = 新規登録画面 */
  mode: 'login' | 'signup'
  /** 画面下のリンクで、ログイン⇄新規登録を切り替えるときに呼ぶ */
  onModeChange: (mode: 'login' | 'signup') => void
  /** ログイン・登録が成功したときに呼ぶ（親が価格画面に戻す） */
  onSuccess: () => void
  /** 「戻る」を押したときに呼ぶ */
  onCancel: () => void
}

export function AuthScreen({ mode, onModeChange, onSuccess, onCancel }: Props) {
  const isSignup = mode === 'signup'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false) // 通信中はボタンを押せないようにする
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // フォーム送信時のページ再読み込みを止める
    setErrorMessage('')
    setInfoMessage('')
    setBusy(true)
    try {
      if (isSignup) {
        const result = await signUp(email, password)
        if (result.status === 'error') {
          setErrorMessage(result.message)
        } else if (result.status === 'needs-email-confirm') {
          setInfoMessage(
            '確認メールを送りました。メール内のリンクを開くと登録が完了します。',
          )
        } else {
          onSuccess()
        }
      } else {
        const result = await signIn(email, password)
        if (result.ok) {
          onSuccess()
        } else {
          setErrorMessage(result.message)
        }
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-gray-500 underline active:text-gray-900"
      >
        ← 価格の一覧に戻る
      </button>

      <h2 className="mt-4 text-lg font-bold">
        {isSignup ? '新規登録' : 'ログイン'}
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        {isSignup
          ? 'メールアドレスとパスワードだけで登録できます。'
          : '登録したメールアドレスとパスワードを入力してください。'}
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="auth-email" className="block text-sm font-medium">
            メールアドレス
          </label>
          <input
            id="auth-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label htmlFor="auth-password" className="block text-sm font-medium">
            パスワード
          </label>
          <input
            id="auth-password"
            type="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg outline-none focus:border-gray-900"
          />
          <p className="mt-1 text-xs text-gray-400">6文字以上で入力してください。</p>
        </div>

        {errorMessage !== '' && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        )}
        {infoMessage !== '' && (
          <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            {infoMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-gray-900 py-3 text-lg font-bold text-white active:bg-gray-700 disabled:opacity-50"
        >
          {busy ? '処理中…' : isSignup ? '登録する' : 'ログインする'}
        </button>
      </form>

      <div className="mt-5 text-center text-sm">
        {isSignup ? (
          <button
            type="button"
            onClick={() => onModeChange('login')}
            className="text-gray-600 underline active:text-gray-900"
          >
            すでにアカウントをお持ちの方は「ログイン」へ
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onModeChange('signup')}
            className="text-gray-600 underline active:text-gray-900"
          >
            アカウントをお持ちでない方は「新規登録」へ
          </button>
        )}
      </div>
    </div>
  )
}
