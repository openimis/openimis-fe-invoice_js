// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
  })],

  resolve: {
    // so that vite nto inject the vite-optinla-deep
    dedupe: [
      'react',
      'react-dom',
      '@emotion/react',
      '@emotion/styled'
    ],

    
    alias: [
      {
        find: '@mui/styled-engine',
        replacement: '@emotion/styled'
      }
    ]
  },

  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.jsx'),
      name: 'Invoice',
      fileName: (format) => `index.${format === 'es' ? 'es' : 'cjs'}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'redux',
        'redux-thunk',
        'redux-api-middleware',
        'react-redux',
        'react-intl',
        'react-helmet',
        'react-multi-date-picker',
        'prop-types',
        'react-date-object/calendars/gregorian',
        'react-date-object/locales/gregorian_en',
        'nepali-date-converter',
        'moment',
        'lodash',
        /^lodash\/.*$/,
        'lodash-uuid',
        'classnames',
        'clsx',
        'react-autosuggest',
        'react-router',
        'react-router-dom',
        'history',
        '@emotion/react',
        '@emotion/styled',
        '@emotion/cache',
        '@mui/material',
        '@mui/icons-material',
        '@mui/system',
        '@mui/styles',
      
        '@date-io/core',
        '@date-io/moment',
        'zxcvbn',
        'flat',

        /^@babel-.*/,
        /^@date-io\/.*/,
        /^@openimis.*/
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'react/jsx-dev-runtime': 'jsxDevRuntime',
          '@emotion/react': 'EmotionReact',
          '@emotion/styled': 'EmotionStyled',
          '@mui/material': 'MuiMaterial',
        }
      }
    },
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true
  }
});
