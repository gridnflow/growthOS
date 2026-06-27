import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, 'src/main/main.ts') },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    // Tray popup lives in src/renderer/tray — point Vite at its index.html
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, 'src/renderer/tray/index.html') },
      },
    },
  },
})
