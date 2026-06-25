import eslint from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  {
    files: ['src/**/*.{ts,tsx}'],
  },
  {
    plugins: {
      'react-hooks': reactHooks,
    },
  },
  {
    ignores: [
      'android',
      'babel.config.js',
      'build',
      'dist',
      'ios',
      'metro.config.js',
      'node_modules',
      'tailwind.config.js',
    ],
  },
  {
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
)
