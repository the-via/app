import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {splitVendorChunkPlugin} from 'vite';
import {createHtmlPlugin} from 'vite-plugin-html';
import {VitePWA} from 'vite-plugin-pwa';
import fs from 'fs';

const hash = fs.readFileSync('public/definitions/hash.json', 'utf8');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VitePWA({
      manifestFilename: 'site.webmanifest',
      manifest: {
        name: "VIA",
        short_name: "VIA",
        description: "VIA - Your keyboard's best friend",
        id: "/",
        start_url: ".",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ],
        theme_color: "#dadada",
        background_color: "#dadada",
        display: "standalone"
      },
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'safari-pinned-tab.svg',
      ],
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.origin && (['/definitions/', '/fonts/', '/images/'].some(prefix => url.pathname.startsWith(prefix)) || url.pathname.endsWith('.glb')),
            handler: 'CacheFirst',
            options: {
              cacheName: 'via-assets',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' && url.pathname.startsWith('/css'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://www.gstatic.com' && url.pathname.startsWith('/draco/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-draco',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    }),
    react(),
    createHtmlPlugin({
      inject: {
        data: {
          hash,
        },
      },
    }),
    splitVendorChunkPlugin(),
  ],
  assetsInclude: ['**/*.glb'],
  envDir: '.',
  server: {open: true},
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      assets: path.resolve(__dirname, './src/assets'),
    },
  },
  optimizeDeps: {
    include: ['@the-via/reader'],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      // Enable esbuild polyfill plugins
      plugins: [],
    },
  },
});
