import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://pihole',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/admin/api.php')
      }
    }
  }
})
