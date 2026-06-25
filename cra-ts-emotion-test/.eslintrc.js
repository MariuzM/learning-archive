module.exports = {
  extends: [
    'react-app',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
  ],
  plugins: ['jsx-a11y'],
  rules: {
    'jsx-a11y/label-has-associated-control': 'off',
    '@typescript-eslint/no-unused-vars': 'off',

    // 'react/jsx-fragments': 'on',
  },
}
