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
  // hmr: false: a page that is open is never reloaded by a file being saved here. Robin plays on this server's
  // home link, and his rule is "never reload a page he is playing on"; with hot reload on, every edit restarted
  // the game under his thumb. A page gets the new code when it is opened or reloaded by hand (Victor, GD, 2026-11-20).
  server: { port: 5178, strictPort: true, host: true, hmr: false },
  preview: { port: 4178, strictPort: true, host: true },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      // What the phone shows when the game is installed: its name, its colours, that it stands upright.
      manifest: {
        name: 'Drok',
        short_name: 'Drok',
        description: 'A solo, old-school grinder: one hero, hunting grounds, chests and rare drops.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#12202b',
        theme_color: '#12202b',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Everything the game needs to run with no network: the page, the pictures, and the pictures' data (json).
        globPatterns: ['**/*.{js,css,html,svg,png,json,webmanifest}'],
        // The Art Director's notes travel with each drop for the record; the phone has no use for them.
        globIgnores: ['**/NOTES.md'],
        // Phaser is big; let the service worker cache it anyway.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      // Off in dev: the browser pane and hot reload stay simple. `npm run build && npm run preview` has the real thing.
      devOptions: { enabled: false },
    }),
  ],
});
