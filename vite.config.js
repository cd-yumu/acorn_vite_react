import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    open:true,
    proxy:{
      // api 경로로 요청되는 모든 요청은 지정된 서버로
      '/api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        // 실제로 서버에 갈 때는 api 가 제거된 채로 Rewrite
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // 이미지 경우
      '/upload':{
        target: 'http://localhost:9000',
        changeOrigin: true
      }
    }
  }
})
