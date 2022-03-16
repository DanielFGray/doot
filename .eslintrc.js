const extensions = ['.ts', '.tsx', '.js', '.jsx']
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    // 'import',
    'jsx-a11y',
    'react',
    'react-hooks',
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    // 'plugin:import/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  env: {
    node: true,
    browser: true,
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
    // 'import/extensions': extensions,
    // 'import/parsers': {
    //   '@typescript-eslint/parser': extensions,
    // },
    // 'import/resolver': {
    //   typescript: {
    //     alwaysTryTypes: false,
    //     project: 'tsconfig.json',
    //   },
    // },
  },
  parserOptions: {
    project: 'tsconfig.json',
  },
  ignorePatterns: ['./*/build/*', './node_modules/'],
  rules: {
    semi: ['error', 'never'],
    quotes: ['error', 'single'],
    indent: ['error', 2, { flatTernaryExpressions: true }],
    'no-unexpected-multiline': 'error',
    'no-nested-ternary': 'off',
    'no-unused-vars': 'off',
    'arrow-parens': ['error', 'as-needed'],
    // 'space-unary-ops': ['error', { overrides: { '!': true } }],
    'object-curly-newline': 'off',
    'no-unused-vars': 'off',
    'react/jsx-props-no-spreading': 'off',
    'valid-jsdoc': 'warn',
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
    'react/prop-types': 'off',
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link', 'NavLink'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    // '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // '@typescript-eslint/no-explicit-any': 'warn',
    // '@typescript-eslint/no-unsafe-assignment': 'warn',
    // '@typescript-eslint/no-unsafe-member-access': 'warn',
    // '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/require-await': 'warn',
    // 'import/extensions': [
    //   'error',
    //   'ignorePackages',
    //   {
    //     ts: 'never',
    //     tsx: 'never',
    //     js: 'never',
    //     jsx: 'never',
    //   },
    // ],
  },
}
