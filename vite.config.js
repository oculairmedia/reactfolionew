import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import { visualizer } from "rollup-plugin-visualizer";

const isCI = process.env.CI || process.env.VERCEL;

export default defineConfig({
  envPrefix: ["VITE_", "REACT_APP_"],
  plugins: [
    react(),
    svgr(),
    ...(!isCI
      ? [
          visualizer({
            open: false,
            gzipSize: true,
            brotliSize: true,
            filename: "bundle-analysis.html",
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      src: "/src",
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    open: true,
    proxy: {
      "/api/video": {
        target: "https://oculair.b-cdn.net/api/v1/videos",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/video/, ""),
        configure: (proxy, options) => {
          proxy.on("proxyRes", (proxyRes, req, res) => {
            proxyRes.headers["Access-Control-Allow-Origin"] = "*";
          });
        },
      },
    },
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
  build: {
    outDir: "build",
    sourcemap: !isCI,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core - loaded on every page
          if (
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react/")
          ) {
            return "vendor";
          }
          // Animation - lazy loaded only when needed
          if (id.includes("node_modules/framer-motion")) {
            return "animation";
          }
          // Syntax highlighting - only for blog
          if (id.includes("node_modules/prism-react-renderer")) {
            return "prism";
          }
          // Icons - split by icon pack for better tree-shaking
          if (id.includes("node_modules/react-icons")) {
            return "icons";
          }
          // Router - core navigation
          if (id.includes("node_modules/@tanstack/react-router")) {
            return "router";
          }
          // Markdown rendering
          if (
            id.includes("node_modules/react-markdown") ||
            id.includes("node_modules/remark") ||
            id.includes("node_modules/unified")
          ) {
            return "markdown";
          }
          // Utilities
          if (
            id.includes("node_modules/axios") ||
            id.includes("node_modules/emailjs-com")
          ) {
            return "utils";
          }
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/\.(css)$/i.test(assetInfo.name)) {
            return "assets/css/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  define: {
    "process.env": {},
  },
  optimizeDeps: {
    entries: ["src/index.tsx"],
    include: ["react", "react-dom", "framer-motion"],
  },
});
