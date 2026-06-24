import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/qwen': {
        target: 'https://hackathon.bitgetops.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/qwen/, '')
      },
      '/api/dashscope': {
        target: 'https://dashscope.aliyuncs.com/compatible-mode',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dashscope/, '')
      },
      '/api/openai': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openai/, '')
      }
    }
  }
})
