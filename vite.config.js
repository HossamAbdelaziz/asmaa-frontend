import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Detect if we're running inside Capacitor (for mobile)
const isCapacitor = process.env.CAPACITOR === 'true';

export default defineConfig({
  base: isCapacitor ? './' : '/', // ✅ Use './' for Capacitor, '/' for web (like Vercel)
  plugins: [react()],
  server: {
    // ✅ Optional: For local development fallback
    fs: {
      allow: [resolve(__dirname)],
    },
  },
});