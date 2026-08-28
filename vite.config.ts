/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    commonjsOptions: {
      // @smogon/calc is a `file:` dependency symlinked from node_modules to
      // vendor/smogon-calc, so its real path falls outside node_modules/** —
      // Rollup's default CJS-conversion scan never reaches it, leaving
      // unconverted require() calls in the production bundle that throw in
      // a real browser (no ambient `require`). Matching all of vendor/
      // (not just this one package) so any future vendored dependency
      // doesn't silently reintroduce this exact failure mode.
      include: [/node_modules/, /vendor\//],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
