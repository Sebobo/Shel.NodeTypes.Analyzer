module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
    'plugin:react/recommended'
  ],
  plugins: [
    '@typescript-eslint',
    'prettier',
    'react'
  ],
  /*parserOptions: {
    jsx: true,
    useJSXTextNode: true
  },*/
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  ignorePatterns: ['.cache', 'dist', 'node_modules/'],
  rules: {
    '@typescript-eslint/indent': ['error', 4],
    "@typescript-eslint/explicit-function-return-type": "off",
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    'prettier/prettier': ['error', {
      semi: true,
      singleQuote: true,
      tabWidth: 4,
      printWidth: 120
    }]
  }
};
