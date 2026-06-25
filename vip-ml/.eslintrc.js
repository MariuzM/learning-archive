module.exports = {
  root: true,
  extends: [
    'react-app',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
  ],
  // plugins: ['jsx-a11y'],
  rules: {
    'jsx-a11y/anchor-is-valid': 'off',
    // '@typescript-eslint/explicit-function-return-type': 'off',
  },
}
