import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        'keyless-vercel-ai-sdk-completions': './keyless-vercel-ai-sdk-completions.html',
        'keyless-vercel-ai-sdk-responses': './keyless-vercel-ai-sdk-responses.html'
      }
    }
  }
})
