import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
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
        manualChunks: {
          vendor: ["react", "react-dom"],
          animation: ["framer-motion"],
          icons: ["react-icons"],
          utils: ["axios", "emailjs-com", "typewriter-effect"],
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
