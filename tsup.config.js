import { defineConfig } from 'tsup';

const entries = [
  [{ okerr: './src/index.ts' }, 'OkErr'],
  [{ base: './src/base.ts' }, 'OkErr'],
  [{ fn: './src/fn/index.ts' }, 'OkErr.Fn'],
  [{ do: './src/do.ts' }, 'OkErr.Do'],
  [{ methods: './src/methods.ts' }, 'OkErr.Methods'],
  [{ lists: './src/lists.ts' }, 'OkErr.Lists'],
  [{ sync: './src/sync.ts' }, 'OkErr'],
  [{ 'sync/methods': './src/sync-methods.ts' }, 'OkErr.Methods'],
  [{ async: './src/async.ts' }, 'OkErr'],
  [{ 'async/methods': './src/async-methods.ts' }, 'OkErr.Methods'],
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
