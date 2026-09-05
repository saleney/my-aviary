import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname, "pages"),
  base: "/my-aviary/",
  publicDir: path.resolve(__dirname, "public"),
  define: {
    "process.env.NEXT_PUBLIC_BASE_PATH": JSON.stringify("/my-aviary"),
  },
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "dist/pages"),
    emptyOutDir: true,
  },
});
