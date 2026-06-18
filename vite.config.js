import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-reconciler', 'three', '@react-three/fiber'],
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'react-reconciler'],
    exclude: ['@babylonjs/core', '@babylonjs/loaders', '@babylonjs/materials', '@babylonjs/gui'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor':   ['three', '@react-three/fiber', '@react-three/drei'],
          'babylon-core':   ['@babylonjs/core'],
          'babylon-extras': ['@babylonjs/loaders', '@babylonjs/materials', '@babylonjs/gui'],
        },
      },
    },
  },
})
