import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Bike-game/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  }
})
