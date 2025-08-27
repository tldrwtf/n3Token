import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve("client", "src"),
      "@shared": path.resolve("shared"),
    },
  },
  root: path.resolve("client"),
  build: {
    outDir: path.resolve("dist", "client"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
