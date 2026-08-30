import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ConfigError } from './components/ConfigError.tsx'
import { AuthProvider } from './context/AuthProvider.tsx'
import { isSupabaseConfigured } from './lib/supabase.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isSupabaseConfigured ? (
      <AuthProvider>
        <App />
      </AuthProvider>
    ) : (
      // 環境変数（VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY）が未設定のとき。
      // 真っ白にせず、原因と直し方を画面に出す。
      <ConfigError />
    )}
  </StrictMode>,
)
