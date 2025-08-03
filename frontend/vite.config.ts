import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  define: {
    'process.env': process.env,
    __HMR_CONFIG_NAME__: JSON.stringify('vite')
  },
  build: {
    outDir: 'export/web' // Set the output directory to export/web
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
      },
    },
  }
})
