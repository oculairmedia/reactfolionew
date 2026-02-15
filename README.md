# React Portfolio with Payload CMS

A professional portfolio site built with React + Vite, powered by a remote Payload CMS backend and Ghost for blogging.

## Tech Stack

- **Frontend**: React 18, TanStack Router, React Bootstrap, Framer Motion
- **Build**: Vite
- **CMS**: Payload CMS (remote server)
- **Blog**: Ghost CMS
- **CDN**: BunnyCDN (media assets)
- **Contact**: EmailJS

## Quick Start

### Prerequisites

- Node.js v18+
- npm or yarn

### Installation

```bash
git clone https://github.com/oculairmedia/reactfolionew.git
cd reactfolionew
npm install
```

### Environment Variables

Create a `.env` file:

```bash
REACT_APP_API_URL=https://your-payload-cms.com/api
REACT_APP_GHOST_URL=https://your-ghost-blog.com
REACT_APP_GHOST_KEY=your_ghost_content_api_key
REACT_APP_CDN_URL=https://your-cdn.com
```

### Development

```bash
npm start          # Vite dev server on http://localhost:3000
npm run preview    # Preview production build
```

### Production Build

```bash
npm run build      # Syncs CMS content, then builds to build/
```

## Available Scripts

```bash
npm start              # Vite dev server
npm run build          # Sync content + production build
npm run preview        # Preview production build
npm run vercel-build   # Production build (Vercel)
npm run sync:content   # Sync CMS content to local JSON fallback
npm run payload        # Start local Payload CMS server (dev)
npm run payload:build  # Build Payload for production
npm run payload:serve  # Serve Payload production build
```

## Architecture

### CMS-First with Fallback

1. **Primary**: Fetch from Payload CMS API at runtime
2. **Fallback**: If CMS is unavailable, use local JSON files from `src/content/`
3. **Sync**: `npm run sync:content` pulls CMS data into local JSON (runs automatically before builds)

### Project Structure

```
reactfolionew/
├── public/                  # Static assets
├── src/
│   ├── app/                 # App shell, routes (TanStack Router)
│   ├── components/          # Shared React components
│   ├── content/             # Fallback JSON (synced from CMS)
│   ├── features/            # Feature modules (layout)
│   ├── header/              # Site header
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Route page components
│   ├── services/            # External API clients (Ghost)
│   └── utils/               # Helpers (CMS API, CDN, fallback)
├── payload/                 # Payload CMS collections & globals
├── scripts/                 # Build & migration scripts
├── server.ts                # Payload Express server
├── vite.config.js           # Vite configuration
└── package.json
```

## Content Management

### Payload CMS

Payload provides the admin UI for managing:

- **Projects** - Case studies with rich media
- **Portfolio** - Grid items for the portfolio page
- **Site Settings** - Logo, contact info, social links
- **Home Intro** - Homepage hero content
- **About Page** - Bio, timeline, skills, services

### Ghost Blog

Blog posts are fetched from Ghost CMS via the Content API.

### API Endpoints

```
GET /api/projects                           # All projects
GET /api/projects?where[id][equals]=<id>    # Single project
GET /api/portfolio                          # Portfolio items
GET /api/globals/site-settings              # Site settings
GET /api/globals/home-intro                 # Home intro
GET /api/globals/about-page                 # About page
```

## Deployment

Frontend deploys to Vercel. Payload CMS runs as a remote server.

Set `REACT_APP_API_URL` to point to your Payload server.

See [docs/](./docs/) for detailed deployment guides.

## License

MIT

## Acknowledgments

- Original template by [@ubaimutl](https://github.com/ubaimutl)
- Enhanced with Payload CMS + Ghost integration
- Built by [Emmanuel Umukoro](https://github.com/oculairmedia) @ Oculair Media
