import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import envCompatible from 'vite-plugin-env-compatible';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
    envPrefix: 'REACT_APP_',
    plugins: [
        react(),
        envCompatible(),
        svgr()
    ],
    resolve: {
        alias: {
            // Add any aliases if CRA supported them (e.g. src absolute imports)
            // Usually CRA supports src absolute imports, Vite needs configuration
            src: "/src",
        },
    },
    server: {
        port: 3000,
        host: '0.0.0.0',
        open: true,
        proxy: {
            '/api/video': {
                target: 'https://oculair.b-cdn.net/api/v1/videos',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/video/, ''),
                configure: (proxy, options) => {
                    proxy.on('proxyRes', (proxyRes, req, res) => {
                        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
                    });
                },
            },
        },
    },
    build: {
        outDir: 'build',
    },
    define: {
        'process.env': {}
    },
    optimizeDeps: {
        entries: ['src/index.jsx'],
    },
});
