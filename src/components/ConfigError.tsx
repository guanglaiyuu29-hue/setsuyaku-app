// Supabase の接続情報が読み込めなかったときに表示する画面。
// 設定ミスで「真っ白」になるのを防ぎ、原因と直し方を伝えるためのページ。

export function ConfigError() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto min-h-screen max-w-md bg-white px-5 py-10 text-gray-900">
        <h1 className="text-lg font-bold">設定エラー</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          Supabase の接続情報が読み込めませんでした。
          データベースにつながらないため、この画面を表示しています。
        </p>

        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-medium">公開先（Netlify など）での直し方</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-700">
            <li>サイトの管理画面 →「Environment variables（環境変数）」を開く</li>
            <li>
              次の2つを追加する（値は Supabase の Project Settings → API）:
              <br />
              <code className="text-xs">VITE_SUPABASE_URL</code>
              <br />
              <code className="text-xs">VITE_SUPABASE_ANON_KEY</code>
            </li>
            <li>サイトを「Redeploy（再デプロイ）」する</li>
          </ol>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-gray-400">
          ローカルで動かすときは、プロジェクト直下の .env に同じ2つを書いて
          「npm run dev」を再起動してください。
        </p>
      </div>
    </div>
  )
}
