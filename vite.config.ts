import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // เปลี่ยน base ให้ตรงกับชื่อ Repository บน GitHub
  base: '/Personal-Tracker/', 
  server: {
    proxy: {
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
    outDir: 'dist',
  },
})