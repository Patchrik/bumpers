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
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
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
