import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// This is the standard configuration for Vite with Tailwind CSS
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      srcDir: "src",
      filename: "sw.js",
      strategies: "injectManifest",
    }),
  ],
});
