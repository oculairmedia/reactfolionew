import { buildConfig } from 'payload/config';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { slateEditor } from '@payloadcms/richtext-slate';
import path from 'path';
import webpack from 'webpack';
// @ts-ignore - require is available in CommonJS/Node environment during bundling
const requireShim = require;

// Collections
import { Projects } from './payload/collections/Projects';
import { Portfolio } from './payload/collections/Portfolio';
import { Users } from './payload/collections/Users';
import { Media } from './payload/collections/Media';

// Globals
import { SiteSettings } from './payload/collections/SiteSettings';
import { HomeIntro } from './payload/globals/HomeIntro';
import { AboutPage } from './payload/globals/AboutPage';
import Navigation from './payload/globals/Navigation';
import Footer from './payload/globals/Footer';
import PortfolioPage from './payload/globals/PortfolioPage';
import ContactPage from './payload/globals/ContactPage';
import UIText from './payload/globals/UIText';

export default buildConfig({
  // Use window.location.origin in browser for admin, env var for server
  serverURL: typeof window !== 'undefined' ? window.location.origin : (process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001'),
  admin: {
    user: 'users',
    bundler: webpackBundler(),
    webpack: (config) => {
      
      // CRITICAL: Tell webpack to treat ALL files from dist/ as external (don't bundle them)
      // This is the nuclear option to prevent server-only code from being bundled
      const existingExternals = config.externals;
      const externalsArray = Array.isArray(existingExternals) 
        ? existingExternals 
        : existingExternals 
          ? [existingExternals] 
          : [];
      
      // Mark Node.js-only modules as external (don't bundle for browser)
      config.externals = [
        ({ request }: { request?: string }, callback: any) => {
          // These modules should NOT be bundled for the browser
          if (request && request.match(/^(child_process|fs|worker_threads|module|uglify-js|@swc\/wasm)$/)) {
            return callback(null, 'commonjs ' + request);
          }
          // Ignore .node binary files and @swc/core native bindings
          if (request && (request.endsWith('.node') || request.includes('@swc/core-'))) {
            return callback(null, 'commonjs ' + request);
          }
          callback();
        },
      ];
      
      // Provide global polyfills and ignore problematic modules
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
        // Ignore .node binaries and SWC native modules
        new webpack.IgnorePlugin({
          resourceRegExp: /\.node$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /@swc\/core-(linux|darwin|win32|freebsd)/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /@swc\/wasm/,
        })
      );
      
      // Add browser polyfills for Node.js core modules
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        assert: requireShim.resolve('assert/'),
        buffer: requireShim.resolve('buffer/'),
        constants: requireShim.resolve('constants-browserify'),
        crypto: requireShim.resolve('crypto-browserify'),
        os: requireShim.resolve('os-browserify/browser'),
        path: requireShim.resolve('path-browserify'),
        process: requireShim.resolve('process/browser'),
        querystring: requireShim.resolve('querystring-es3'),
        stream: requireShim.resolve('stream-browserify'),
        tty: requireShim.resolve('tty-browserify'),
        url: requireShim.resolve('url/'),
        util: requireShim.resolve('util/'),
        vm: requireShim.resolve('vm-browserify'),
        zlib: requireShim.resolve('browserify-zlib'),
      };


      
      return config;
    },
    meta: {
      titleSuffix: '- Portfolio CMS',
      favicon: '/favicon.ico',
    },
  },
  editor: slateEditor({}),
  collections: [
    Users,
    Projects,
    Portfolio,
    Media,
  ],
  globals: [
    SiteSettings,
    HomeIntro,
    AboutPage,
    Navigation,
    Footer,
    PortfolioPage,
    ContactPage,
    UIText,
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio',
  }),
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
    process.env.REACT_APP_URL || 'http://localhost:3000',
    'http://192.168.50.90:3006',
    'http://localhost:3006',
    'https://cms.emmanuelu.com',
    'https://cms2.emmanuelu.com',
    'https://www.emmanuelu.com',
    'https://emmanuelu.com',
  ].filter(Boolean),
  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
    process.env.REACT_APP_URL || 'http://localhost:3000',
    'http://192.168.50.90:3006',
    'http://localhost:3006',
    'https://cms.emmanuelu.com',
    'https://cms2.emmanuelu.com',
    'https://www.emmanuelu.com',
    'https://emmanuelu.com',
  ].filter(Boolean),
});
