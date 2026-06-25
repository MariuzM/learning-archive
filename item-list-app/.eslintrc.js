module.exports = {
  root: true,

  extends: [
    'react-app',
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
  ],

  rules: {
    'react/prop-types': 'off',
  },

  parserOptions: {
    project: './tsconfig.json',
  },
}
