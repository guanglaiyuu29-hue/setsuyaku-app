import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // base = 公開時に、JS/CSS などの読み込みパスの先頭に付く文字列。
  // ・ドメイン直下で公開する場合（Netlify / Vercel）は '/' （このままでOK）。
  // ・GitHub Pages のようにサブフォルダ（https://～/リポジトリ名/）で公開する
  //   場合だけ、'/リポジトリ名/' に変更する必要がある。
  base: '/',
  plugins: [react(), tailwindcss()],
})
