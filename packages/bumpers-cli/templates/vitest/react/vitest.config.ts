import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['{{reactTestGlobInclude}}'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
        perFile: true,
        autoUpdate: true,
      },
      exclude: [
        'node_modules',
        'dist',
        '.storybook',
        'e2e',
        'scripts/**',
        '**/*.config.*',
        '**/*.stories.*',
        '{{reactMainFile}}',
{{reactRouteTreeGenExclude}}
        '**/*.d.ts',
      ],
    },
  },
});
