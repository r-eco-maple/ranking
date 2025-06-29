import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' 
    ? '/ranking/' // GitHub Pages用のベースパス
    : '/',
  define: {
    // React DevToolsを本番環境でのみ無効化
    ...(process.env.NODE_ENV === 'production' && {
      __REACT_DEVTOOLS_GLOBAL_HOOK__: 'undefined'
    })
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild', // esbuildを使用（デフォルト、高速）
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['react-select']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
})