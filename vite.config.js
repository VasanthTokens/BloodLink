import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // The Arena preview proxies the dev server behind a *.e2b.app host, so the
    // Host header must be allowed or the iframe receives a 403.
    allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1'],
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1'],
  },
  build: {
    target: 'es2019',
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ['framer-motion'],
          gsap: ['gsap'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
})

// The Arena preview proxies each dev server behind a *.e2b.app host, so Vite
// must accept that Host header or the iframe gets a 403.
