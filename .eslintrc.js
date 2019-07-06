module.exports = {
  parser: 'babel-eslint',

  // NOTE: using `plugin:` prefix makes it so that the corresponding
  // eslint plugin is automatically enabled and the rules are turned on
  extends: [
    'standard',
    'plugin:react/recommended',
    // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors.
    // Make sure this is always the last configuration in the extends array.
    'plugin:prettier/recommended',
    'prettier/react',
    'prettier/standard',
  ],

  plugins: ['react-hooks'],

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },

  env: {
    browser: true,
    jest: true,
  },

  rules: {
    // Enforce absolute imports to be first
    'import/order': [
      'error',
      {
        groups: [
          ['builtin', 'external', 'internal'],
          ['parent', 'sibling', 'index'],
        ],
      },
    ],

    'no-var': 'error', // No `var` plz - we are not savages anymore
    'react/prop-types': 0,

    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },

  settings: {
    react: {
      version: 'detect',
    },
  },
};
