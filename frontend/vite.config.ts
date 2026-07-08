import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    watch: {
      ignored: [path.resolve(__dirname, 'src/utils/request/white.json')],
    },
    proxy: {
      '/proxy': {
        target: 'http://127.0.0.1:39120',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy/, ''),
      },
    },
  },
})
