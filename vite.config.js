import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './', // ✅ Crucial for Capacitor iOS WebView to load assets correctly
  plugins: [react()],
})