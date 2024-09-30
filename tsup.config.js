import { defineConfig } from 'tsup';

const entries = [
  [{ resultage: './src/index.ts' }, 'Resultage'],
  [{ base: './src/base.ts' }, 'Resultage'],
  [{ fn: './src/fn/index.ts' }, 'Resultage.Fn'],
  [{ methods: './src/methods.ts' }, 'Resultage.Methods'],
  [{ lists: './src/lists.ts' }, 'Resultage.Lists'],
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
