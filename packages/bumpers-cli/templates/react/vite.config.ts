import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
      routeFileIgnorePattern: '(\\.test\\.(ts|tsx|js|jsx)$)|(\\.js$)',
    }),
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
});
