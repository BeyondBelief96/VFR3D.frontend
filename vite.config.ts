import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
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
        manualChunks: {
          cesium: ['cesium'],
          mantine: ['@mantine/core', '@mantine/hooks', '@mantine/form', '@mantine/dates', '@mantine/notifications'],
          redux: ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
        },
      },
    },
  },
});
