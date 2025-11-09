import { buildConfig } from 'payload/config';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { slateEditor } from '@payloadcms/richtext-slate';
import path from 'path';

// Collections
import { Projects } from './collections/Projects';
import { Portfolio } from './collections/Portfolio';
import { Users } from './collections/Users';
import { Media } from './collections/Media';

// Globals
import { SiteSettings } from './collections/SiteSettings';
import { HomeIntro } from './globals/HomeIntro';
import { AboutPage } from './globals/AboutPage';

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  admin: {
    user: 'users',
    bundler: webpackBundler(),
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
  ].filter(Boolean),
  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
    process.env.REACT_APP_URL || 'http://localhost:3000',
  ].filter(Boolean),
});
