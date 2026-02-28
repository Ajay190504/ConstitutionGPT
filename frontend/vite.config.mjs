import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic",
    }),
  ],
  server: {
    allowedHosts: [
      'pepper-disco-vegas-cash.trycloudflare.com'
    ]
  }
})

