import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // On Vercel, use root '/'. On GitHub Pages, use '/nosey-cat/'
  base: process.env.VERCEL ? '/' : (process.env.NODE_ENV === 'production' ? '/nosey-cat/' : '/'),
});

