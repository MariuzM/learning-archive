import react from '@vitejs/plugin-react';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            '@emotion',
            {
              sourceMap: false,
              autoLabel: 'dev-only',
              labelFormat: '-------[filename]-------',
              cssPropOptimization: false,
              displayName: false,
            },
          ],
        ],
      },
    }),
    splitVendorChunkPlugin(),
  ],
  define: {
    'process.env': process.env,
  },
  build: {
    polyfillModulePreload: false,
    // cssTarget: ['es2022'],
    // minify: false,
    minify: 'terser',
    terserOptions: {
      ecma: 2020,
      // mangle: {
      //   keep_classnames: false,
      //   keep_fnames: false,
      // },
      // keep_classnames: false,
      // keep_fnames: false,
      format: {
        comments: false,
      },
      compress: true,
      ie8: false,
      safari10: false,
    },
    // rollupOptions: {
    //   output: {
    //     compact: true,
    //   },
    // },
  },
  // esbuild: {
  //   logOverride: { 'this-is-undefined-in-esm': 'silent' },
  // },
});
