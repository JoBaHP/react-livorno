import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // The file to use as the service worker
      srcDir: "src",
      filename: "sw.js",
      // The strategy for the service worker
      strategies: "injectManifest",
    }),
  ],
});
