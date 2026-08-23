import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        finance: resolve(__dirname, "projects/flight-finance-agent.html"),
        quality: resolve(__dirname, "projects/hotel-ups-quality.html"),
        attribution: resolve(__dirname, "projects/used-car-attribution.html"),
        careerAssistant: resolve(__dirname, "projects/job-search-assistant.html"),
      },
    },
  },
});
