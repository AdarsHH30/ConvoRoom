import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    build: {
      chunksizeWarningLimit: 1000,
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'], 
          },
        },
      },
    },
  },
});
