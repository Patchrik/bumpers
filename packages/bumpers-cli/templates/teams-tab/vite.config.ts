import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';

const useHttps = process.env.BUMPERS_TEAMS_HTTPS === '1';

export default defineConfig({
  plugins: [react(), ...(useHttps ? [mkcert()] : [])],
  server: {
    host: '127.0.0.1',
    port: 53000,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
  },
});
