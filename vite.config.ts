import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter(),
    react(),
    cesium(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Skip cesium - it's handled by vite-plugin-cesium as external
          if (id.includes('cesium')) {
            return undefined;
          }
          if (id.includes('@mantine/core') || id.includes('@mantine/hooks') ||
              id.includes('@mantine/form') || id.includes('@mantine/dates') ||
              id.includes('@mantine/notifications')) {
            return 'mantine';
          }
          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux') ||
              id.includes('redux-persist')) {
            return 'redux';
          }
        },
      },
    },
  },
});
