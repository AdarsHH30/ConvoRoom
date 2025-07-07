import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";


export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'analyze' && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dropdown-menu', '@radix-ui/react-slot', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          'vendor-markdown': ['react-markdown', 'remark-gfm'],
          'vendor-syntax': ['react-syntax-highlighter'],
          'vendor-animations': ['framer-motion', '@tsparticles/engine', '@tsparticles/react', '@tsparticles/slim'],
        },
      },
    },
  },
}));
