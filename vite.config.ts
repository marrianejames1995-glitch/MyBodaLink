import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// Deploy under a subpath (e.g. a GitHub Pages project site) by setting
// BASE_PATH=/MyBodaLink/ at build time. Defaults to "/" for root deploys
// (custom domain, Vercel, Netlify, the local dev server).
const base = process.env.BASE_PATH ?? '/'

// https://vitejs.dev/config/
export default defineConfig({
  base,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'MyBodaLink',
        short_name: 'MyBodaLink',
        description: 'Connect with trusted riders and taxi drivers across Kenya.',
        theme_color: '#16a34a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        // Keep these base-relative so the PWA installs correctly under a subpath.
        scope: base,
        start_url: base,
        categories: ['travel', 'navigation', 'lifestyle'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,jpg,jpeg}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'mybodalink-app-cache',
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
