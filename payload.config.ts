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
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
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
      
      config.externals = [
        ({ request }: { request?: string }, callback: any) => {
          if (request && request.match(/^(child_process|fs|path|util)$/)) {
            return callback(null, 'commonjs ' + request);
          }
          callback();
        },
      ];
      
      // Ignore Node.js core modules completely
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
      
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: requireShim.resolve('buffer/'),
        process: requireShim.resolve('process/browser'),
        stream: requireShim.resolve('stream-browserify'),
        util: requireShim.resolve('util/'),
        path: requireShim.resolve('path-browserify'),
        crypto: requireShim.resolve('crypto-browserify'),
        vm: requireShim.resolve('vm-browserify'),
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
    'https://cms.emmanuelu.com',
    'https://cms2.emmanuelu.com',
    'https://www.emmanuelu.com',
    'https://emmanuelu.com',
  ].filter(Boolean),
  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
    process.env.REACT_APP_URL || 'http://localhost:3000',
    'https://cms.emmanuelu.com',
    'https://cms2.emmanuelu.com',
    'https://www.emmanuelu.com',
    'https://emmanuelu.com',
  ].filter(Boolean),
});
