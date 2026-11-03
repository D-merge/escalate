import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// On GitHub Pages the app lives at https://<user>.github.io/<repo>/
// The deploy workflow sets BASE_PATH to "/<repo>/". Locally it is "/".
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png", "favicon.svg"],
      manifest: {
        name: "Escalate", short_name: "Escalate",
        description: "Personal workout log, progression and strength score. All data stays on your phone.",
        theme_color: "#1A0B2E",
        background_color: "#1A0B2E",
        display: "standalone",
        orientation: "portrait",
        start_url: base,
        scope: base,
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico,webmanifest}"],
      },
    }),
  ],
});
