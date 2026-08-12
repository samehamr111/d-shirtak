import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // framer-motion is used by a handful of components (ProductCard, HomePage, Reveal)
          // that are shared across most now-separately-lazy-loaded routes -- without this it'd
          // get duplicated into several route chunks instead of being fetched/cached once.
          "framer-motion": ["framer-motion"],
        },
      },
    },
  },
});
