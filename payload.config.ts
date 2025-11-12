import { buildConfig } from 'payload/config';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { slateEditor } from '@payloadcms/richtext-slate';
import path from 'path';

// Collections
import { Projects } from './payload/collections/Projects';
import { Portfolio } from './payload/collections/Portfolio';
import { Users } from './payload/collections/Users';
import { Media } from './payload/collections/Media';

// Globals
import { SiteSettings } from './payload/collections/SiteSettings';
import { HomeIntro } from './payload/globals/HomeIntro';
import { AboutPage } from './payload/globals/AboutPage';

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  admin: {
    user: 'users',
    bundler: webpackBundler(),
    webpack: (config) => {
      const webpack = require('webpack');
      const path = require('path');
      
      // CRITICAL: Tell webpack to treat ALL files from dist/ as external (don't bundle them)
      // This is the nuclear option to prevent server-only code from being bundled
      const existingExternals = config.externals;
      const externalsArray = Array.isArray(existingExternals) 
        ? existingExternals 
        : existingExternals 
          ? [existingExternals] 
          : [];
      
      config.externals = [
        ...externalsArray,
        function({ context, request }: any, callback: any) {
          // Treat anything from dist/ as external (don't bundle it)
          if (request && (
            request.includes('/dist/') || 
            request.includes('\\dist\\') ||
            request.startsWith('./dist/') ||
            request.startsWith('../dist/')
          )) {
            return callback(null, 'commonjs ' + request);
          }
          callback();
        },
      ];
      
      // Ignore Node.js core modules completely
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(child_process|util|fs|path)$/,
        })
      );
      
      // Add fallbacks for Node.js core modules (if they somehow get through)
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        util: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
        process: false,
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
