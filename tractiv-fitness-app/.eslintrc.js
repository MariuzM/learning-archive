module.exports = {
  parser: '@typescript-eslint/parser',

  plugins: ['@typescript-eslint'],

  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],

  settings: {
    'import/ignore': ['react-native'],
  },

  rules: {
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/consistent-type-imports': 'error',

    'sort-imports': ['error', { ignoreCase: true, ignoreDeclarationSort: true }],
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
  },
};
