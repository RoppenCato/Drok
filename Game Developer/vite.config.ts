import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// The client lives in client/; rules/ sits beside it and is imported straight from source, with no build of its own.
export default defineConfig({
  root: 'client',
  publicDir: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'es2022',
    // Phaser alone is about 1.4 MB of script (360 kB gzipped); warn only above that.
    chunkSizeWarningLimit: 1500,
  },
  // host: true puts the server on the LAN too, so a phone on the same Wi-Fi can open the address Vite prints.
  // 5178 and 4178, not Vite's usual 5173 and 4173: Robin's other games hold those on this PC (Victor, GD, 2026-11-19).
  server: { port: 5178, strictPort: true, host: true },
  preview: { port: 4178, strictPort: true, host: true },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      // Drok is a placeholder: the setup puts the game's name here, in client/index.html and in client/src/layout.ts.
      manifest: {
        name: 'Drok',
        short_name: 'Drok',
        description: 'A 2D game for the phone.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#1b1f2a',
        theme_color: '#1b1f2a',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        // Phaser is big; let the service worker cache it anyway.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      // Off in dev: the browser pane and hot reload stay simple. `npm run build && npm run preview` has the real thing.
      devOptions: { enabled: false },
    }),
  ],
});
