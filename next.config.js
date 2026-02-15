/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oculair.b-cdn.net',
        port: '',
        pathname: '/**',
      },
      // Keep other domains if you used them in your old project
    ],
  },
  // If you need to rewrite API calls to Payload (running on a different port locally?)
  // For now, let's assume Payload is part of this or running separately.
  // If running separately on port 3001:
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // Proxy to Payload
      },
       {
        source: '/admin/:path*',
        destination: 'http://localhost:3001/admin/:path*', // Proxy to Payload Admin
      },
    ];
  },
};

module.exports = nextConfig;
