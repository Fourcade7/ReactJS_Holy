import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  // GitHub Pages loyihani /ReactJS_Holy/ sub-yo'lida joylashtiradi, shuning uchun
  // oddiy `npm run build` shu bazani ishlatadi. Electron ilovasi esa app:// protokoli
  // orqali ildizdan xizmat qiladi — ElectronJS_Holy/scripts/build-react.js shu uchun
  // ELECTRON_BUILD=1 bilan chaqiradi.
  base: process.env.ELECTRON_BUILD ? '/' : '/ReactJS_Holy/',
})
