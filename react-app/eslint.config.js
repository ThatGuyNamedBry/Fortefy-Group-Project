import js from '@eslint/js';
import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
    { ignores: ['build/', 'node_modules/'] },
    js.configs.recommended,
    react.configs.flat.recommended,
    // The automatic JSX runtime: no `import React` needed for JSX
    react.configs.flat['jsx-runtime'],
    jsxA11y.flatConfigs.recommended,
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
        },
        settings: { react: { version: 'detect' } },
        plugins: { 'react-hooks': reactHooks },
        rules: {
            // The app has no PropTypes; the tests cover the props instead
            'react/prop-types': 'off',
            // The two hooks rules Create React App enforced. The plugin's
            // recommended set now adds the React Compiler's rules too, which
            // flag 15 places that would need reworking, not just tidying
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
    },
    {
        files: ['**/*.test.{js,jsx}', 'src/setupTests.js', 'src/testUtils.jsx'],
        languageOptions: { globals: { ...globals.browser, ...globals.vitest } },
    },
    {
        files: ['vite.config.js', 'eslint.config.js'],
        languageOptions: { globals: globals.node },
    },
];
