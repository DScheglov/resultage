/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'tsup';

const entries = [
  [{ result: './src/index.ts' }, 'Result'],
  [{ base: './src/base.ts' }, 'Result'],
  [{ fn: './src/fn/index.ts' }, 'ResultFn'],
  [{ do: './src/do.ts' }, 'ResultDo'],
  [{ methods: './src/methods.ts' }, 'ResultMethods'],
  [{ lists: './src/lists.ts' }, 'ResultLists'],
  [{ sync: './src/sync.ts' }, 'Result'],
  [{ 'sync/methods': './src/sync-methods.ts' }, 'ResultMethods'],
  [{ async: './src/async.ts' }, 'Result'],
  [{ 'async/methods': './src/async-methods.ts' }, 'ResultMethods'],
];

export default defineConfig(entries.map(([entry, globalName]) => ({
  entry,
  globalName,
  format: ['iife'],
  outExtension() {
    return {
      js: '.min.js',
    };
  },
  dts: true,
  minify: false,
  splitting: false,
  sourcemap: true,
  outDir: 'dist',
})));
