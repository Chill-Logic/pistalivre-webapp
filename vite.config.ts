import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, type Plugin } from "vite";
import { VitePWA, type ManifestOptions } from "vite-plugin-pwa";
import { PWA_REALM_APPS } from "./src/constants/pwa";

const manifest: Partial<ManifestOptions> = {
  name: "Pista Livre",
  short_name: "Pista Livre",
  description: "Gestão de locação de veículos",
  lang: "pt-BR",
  theme_color: "#E4141B",
  background_color: "#FAFAF9",
  display: "standalone",
  orientation: "portrait",
  start_url: "/",
  scope: "/",
  icons: [
    { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
    { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
    { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
    {
      src: "maskable-icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
};

/**
 * One manifest per area, next to the generic one: each domain installs as
 * its own app (src/helpers/pwa-manifest swaps the link). No `id`: each
 * domain is its own origin already, and keeping the default lets an app
 * installed with the generic name update in place.
 */
function realmManifests(): Plugin {
  return {
    name: "realm-manifests",
    apply: "build",
    generateBundle() {
      for (const app of Object.values(PWA_REALM_APPS)) {
        this.emitFile({
          type: "asset",
          fileName: app.manifest.slice(1),
          source: JSON.stringify({
            ...manifest,
            name: app.name,
            short_name: app.shortName,
          }),
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    realmManifests(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.ico", "apple-touch-icon-180x180.png"],
      manifest,
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // API responses are never cached by the service worker: stale billing
        // data is worse than an offline error. React Query owns the cache.
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    rollupOptions: {
      output: {
        // Vendor chunks change less than app code: the service worker only
        // re-downloads what actually changed between deploys.
        manualChunks: {
          react: ["react", "react-dom", "react-dom/client", "react-router-dom"],
          query: ["@tanstack/react-query"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          ui: [
            "@radix-ui/react-slot",
            "@radix-ui/react-label",
            "@radix-ui/react-select",
            "@radix-ui/react-dialog",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-popover",
            "lucide-react",
            "sonner",
          ],
        },
      },
    },
  },
  server: { host: true, port: 5173 },
});
