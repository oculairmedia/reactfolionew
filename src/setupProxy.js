const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/video',
    createProxyMiddleware({
      target: 'https://oculair.b-cdn.net/api/v1/videos',
      changeOrigin: true,
      pathRewrite: {
        '^/api/video': '', // Remove the /api/video prefix when forwarding
      },
      onProxyRes: function(proxyRes, req, res) {
        // Add CORS headers
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      },
    })
  );
};