# React Portfolio with Payload CMS

A professional portfolio template for developers and designers, built with React and powered by Payload CMS.

## Features

- **Fully Responsive** - Works seamlessly on all devices
- **Multi-Page Layout** - Home, About, Portfolio, Projects, Contact pages
- **Contact Form** - Integrated with EmailJS
- **React-Bootstrap** - Modern, clean UI components
- **Payload CMS** - Powerful headless CMS for content management
- **Database-Backed** - MongoDB for reliable content storage
- **REST & GraphQL APIs** - Flexible data fetching options
- **Rich Admin UI** - Intuitive content management interface
- **Media Management** - Built-in file upload and storage

## Tech Stack

- **Frontend**: React, React Router, React Bootstrap, Framer Motion
- **Backend**: Payload CMS, Express
- **Database**: MongoDB
- **Deployment**: Vercel (frontend), Railway/Heroku (backend options)

## Quick Start

### Prerequisites

- Node.js v18 or higher
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/oculairmedia/reactfolionew.git
   cd reactfolionew
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:
   - `PAYLOAD_SECRET` - Generate with: `openssl rand -base64 32`
   - `MONGODB_URI` - Your MongoDB connection string
   - `PAYLOAD_PUBLIC_SERVER_URL` - Payload server URL
   - `REACT_APP_API_URL` - API endpoint for frontend

4. **Start the Payload CMS backend**
   ```bash
   npm run payload
   ```

   Access the admin panel at `http://localhost:3001/admin`

5. **Create your first admin user**
   - Navigate to `http://localhost:3001/admin`
   - Fill in the "Create First User" form

6. **Start the React frontend** (in a new terminal)
   ```bash
   npm start
   ```

   View your site at `http://localhost:3000`

## Content Management

### Using Payload CMS

Payload CMS provides a powerful admin interface at `/admin` where you can:

- **Projects** - Add detailed project case studies
- **Portfolio** - Manage portfolio grid items
- **Site Settings** - Update logo, contact info, social links
- **Home Intro** - Edit homepage introduction and animated text
- **About Page** - Update bio, timeline, skills, and services
- **Media** - Upload and manage images and videos

### 🔄 CMS-First with Fallback Architecture

This site uses a **resilient content architecture** that ensures your site stays online even if the CMS is temporarily unavailable:

#### How It Works

1. **Primary Source**: Content is fetched from Payload CMS API
2. **Fallback**: If CMS is unavailable, local JSON files are used
3. **Sync**: Content is automatically synced before each build

#### Benefits

✅ **High Availability** - Site works even if CMS is down  
✅ **Local Development** - No CMS dependency for frontend dev  
✅ **Disaster Recovery** - Automatic content backup  
✅ **Fast Builds** - Pre-synced content for static builds  
✅ **Monitoring** - Track when fallback is used

#### Content Sync

Sync content from CMS to local JSON files:

```bash
# Manual sync
npm run sync:content

# Automatic sync (runs before builds)
npm run build           # Syncs, then builds
npm run vercel-build    # Syncs, then builds for Vercel
```

The sync script:
- Fetches all content from Payload CMS API
- Updates local JSON files in `src/content/`
- Only fails build if critical content (portfolio/projects) is unavailable
- Logs all sync activity for monitoring

#### Monitoring Fallback Usage

The app logs when fallback content is used:

```javascript
import { getFallbackStats, getFallbackEvents } from './utils/cmsWithFallback';

// Get statistics
const stats = getFallbackStats();
console.log(stats);
// {
//   total_events: 5,
//   last_24h: 2,
//   success_rate: "100.0",
//   most_common_source: "portfolio",
//   most_common_reason: "Request timeout"
// }

// Get detailed events
const events = getFallbackEvents();
// [{ timestamp, source, reason, status, userAgent }, ...]
```

All fallback events are logged to the browser console with emoji indicators:
- 🔄 = Fallback used successfully
- ❌ = Fallback failed

### API Access

All content is available via REST API:

```javascript
// Fetch projects
GET /api/projects

// Fetch single project
GET /api/projects?where[id][equals]=project-id

// Fetch globals
GET /api/globals/site-settings
GET /api/globals/home-intro
GET /api/globals/about-page
```

See the [Documentation Index](./docs/INDEX.md) for complete documentation.

## 📚 Documentation

**[📖 Full Documentation Index](./docs/INDEX.md)** - Complete guide to all documentation

### Quick Links

- **[Quick Start Guide](./docs/QUICK-START.md)** - Get up and running fast
- **[Payload CMS Setup](./docs/setup/PAYLOAD_CMS_SETUP.md)** - Complete setup instructions
- **[Ghost Blog Integration](./docs/setup/GHOST_API_SETUP.md)** - Ghost CMS blog setup
- **[Vercel + Docker Deployment](./docs/deployment/DOCKER_BACKEND_DEPLOYMENT.md)** - Recommended deployment (Vercel frontend + Docker backend)
- **[Migration Guide](./docs/migration/MIGRATION_TO_PAYLOAD.md)** - Migrating from Sveltia CMS

## Development

### Available Scripts

```bash
# Frontend
npm start              # Start React development server
npm run build          # Sync content + build React app for production
npm run vercel-build   # Sync content + build for Vercel

# Content Management
npm run sync:content   # Sync content from CMS to local JSON files

# Backend
npm run payload        # Start Payload CMS server (dev)
npm run payload:build  # Build Payload for production
npm run payload:serve  # Run Payload production build

# Build Analysis
npm run build:analyze  # Analyze bundle size
```

### Project Structure

```
reactfolionew/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── content/         # Fallback JSON content (synced from CMS)
│   │   ├── portfolio/   # Portfolio items
│   │   ├── projects/    # Project pages
│   │   ├── settings/    # Site settings, navigation, footer
│   │   ├── intro/       # Home page intro
│   │   ├── about/       # About page content
│   │   └── pages/       # Page metadata
│   ├── utils/           # Utility functions
│   │   ├── payloadApi.js        # CMS API helpers
│   │   └── cmsWithFallback.js   # Fallback + monitoring
│   └── assets/          # Images, styles, etc.
├── scripts/
│   └── sync-content.js  # CMS → JSON sync script
├── payload/
│   ├── collections/     # Payload collection definitions
│   ├── globals/         # Payload global definitions
│   └── config.ts        # Payload configuration
├── server.ts            # Payload Express server
├── tsconfig.server.json # TypeScript config for backend
└── package.json
```

## Deployment

### Development

Run both frontend and backend locally:

```bash
# Terminal 1: Backend
npm run payload

# Terminal 2: Frontend
npm start
```

### Production

**Option 1: Hybrid - Vercel Frontend + Docker Backend (Recommended)**
- Frontend on Vercel (free, fast CDN)
- Backend on your VPS with Docker ($5-12/month)
- Best of both worlds: speed + control
- See [docs/deployment/DOCKER_BACKEND_DEPLOYMENT.md](./docs/deployment/DOCKER_BACKEND_DEPLOYMENT.md)

**Option 2: Full Docker on Your Own Server**
- Deploy everything with Docker on a VPS ($5-12/month)
- Full control, easy backups, scales well
- See [docs/deployment/DOCKER_DEPLOYMENT.md](./docs/deployment/DOCKER_DEPLOYMENT.md)

**Option 3: Separate Managed Services**
- Deploy React frontend to Vercel (free)
- Deploy Payload backend to Railway, Heroku, or DigitalOcean ($5-7/month)
- Update `REACT_APP_API_URL` to point to backend URL

**Option 4: Vercel Serverless (Advanced)**
- Requires additional Payload serverless configuration
- See Payload documentation for details

See [deployment guides](./docs/deployment/) for detailed instructions.

## Migration from Sveltia CMS

If you're upgrading from the previous Sveltia CMS implementation:

1. Follow the [Migration Guide](./docs/migration/MIGRATION_TO_PAYLOAD.md)
2. Use the provided migration scripts or manual process
3. Update frontend components to use Payload API
4. Test thoroughly before production deployment

## Support & Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Payload Discord Community](https://discord.com/invite/payload)
- [MongoDB Documentation](https://docs.mongodb.com/)

## License

MIT License - feel free to use this template for your own portfolio!

## Acknowledgments

- Original template by [@ubaimutl](https://github.com/ubaimutl)
- Enhanced with Payload CMS integration
- Built by [Emmanuel Umukoro](https://github.com/oculairmedia) @ Oculair Media

---

If you find this template helpful, please give it a ⭐ 
