import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // ✅ Crucial for Capacitor iOS WebView to load assets correctly
  plugins: [react()],
  server: {
    historyApiFallback: true, // ✅ Fix: Allows direct URL access in SPA routing
  },
});