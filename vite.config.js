import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  resolve: {
    dedupe: ['react', 'react-dom', 'react-reconciler', 'three', '@react-three/fiber'],
  },

  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'react-reconciler'],
    exclude: ['@babylonjs/core', '@babylonjs/loaders', '@babylonjs/materials', '@babylonjs/gui'],
  },

  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core — always needed
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router')) {
            return 'react-vendor'
          }
          // Three.js stack — loaded with studio/3D pages
          if (id.includes('node_modules/three') || id.includes('@react-three')) {
            return 'three-vendor'
          }
          // Babylon — only with BabylonDesigner lazy page; keep in its own chunk
          if (id.includes('@babylonjs/core')) return 'babylon-core'
          if (id.includes('@babylonjs/loaders') || id.includes('@babylonjs/materials') ||
              id.includes('@babylonjs/gui'))    return 'babylon-extras'
        },
      },
    },
  },
})
