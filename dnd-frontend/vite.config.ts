import { defineConfig } from 'vite'
import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      '@features': path.resolve(import.meta.dirname, 'src/features'),
      '@components': path.resolve(import.meta.dirname, 'src/components'),
      '@appTypes': path.resolve(import.meta.dirname, 'src/types'),
      '@store': path.resolve(import.meta.dirname, 'src/store'),
      '@utils': path.resolve(import.meta.dirname, 'src/utils'),
      '@pages': path.resolve(import.meta.dirname, 'src/pages'),
      '@services': path.resolve(import.meta.dirname, 'src/services'),
      '@validations': path.resolve(import.meta.dirname, 'src/validations'),
      '@styles': path.resolve(import.meta.dirname, 'src/styles'),
      '@signalr': path.resolve(import.meta.dirname, 'src/SignalR'),
      '@api': path.resolve(import.meta.dirname, 'src/api'),
      '@hooks': path.resolve(import.meta.dirname, 'src/hooks'),
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  server: {
    host:'0.0.0.0',
    port:3000,
    strictPort: true,
  }
})
