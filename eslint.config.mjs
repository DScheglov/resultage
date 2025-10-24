import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierPlugin from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  globalIgnores([
    'dist/**/*',
    'esm/**/*',
    'lib/**/*',
    'coverage/**/*',
    'dist/**/*',
  ]),
  tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'class-methods-use-this': 'off',
      'require-yield': 'off',
    },
  },
  {
    files: ['**/*.test.{js,ts}', '**/__tests__/**/*.{js,ts}'],
    rules: {
      'no-empty': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  prettierPlugin,
  {
    rules: {
      'prettier/prettier': [
        'error',
        {
          trailingComma: 'all',
          tabWidth: 2,
          useTabs: false,
          semi: true,
          singleQuote: true,
          experimentalTernaries: false,
        },
      ],
    },
  },
]);
