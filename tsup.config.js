import { defineConfig } from 'tsup';

const entries = [
  [{ resultage: './src/index.ts' }, 'Resultage'],
  [{ fn: './src/fn/index.ts' }, 'Resultage.Fn'],
];

export default defineConfig(
  entries.map(([entry, globalName, options]) => ({
    entry,
    globalName,
    format: ['iife'],
    outExtension() {
      return {
        js: '.min.js',
      };
    },
    dts: true,
    minify: 'terser',
    splitting: false,
    sourcemap: true,
    outDir: 'dist',
    ...options,
  })),
);
