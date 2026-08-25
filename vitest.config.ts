import { defineConfig } from 'vitest/config';
import path from 'path';

// Alias '@' -> src (coerente con tsconfig paths) cosi' i test possono importare i moduli app.
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
