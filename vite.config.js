// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

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
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        /^@babel\..*/,
        /^@date-io\/.*/,
        /^@openimis\./,
        'classnames',
        'clsx',
        'history',
        /^lodash\..*/,
        'moment',
        'prop-types',
        /^react($|\/)/,
        /^redux($|\/)/,
        'flat'
      
      ],
      output: {
        globals: {
          react: 'React'
        }
      }
    },
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true
  }
});
