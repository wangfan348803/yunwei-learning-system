import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split stable vendor and the large static question bank into their own
        // chunks so app-code changes don't force users to re-download them.
        manualChunks(id) {
          if (id.includes('functions/_shared/questions')) return 'questions'
          if (id.includes('node_modules')) return 'vendor'
          return undefined
        },
      },
    },
  },
})
