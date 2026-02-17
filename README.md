# React Portfolio with Payload CMS

A professional portfolio site built with React + Vite, powered by a remote Payload CMS backend and Ghost for blogging.

## Tech Stack

- **Frontend**: React 18, TanStack Router, Tailwind CSS, daisyUI, Framer Motion
- **Build**: Vite + Bun (runtime)
- **CMS**: Payload CMS (remote server)
- **Blog**: Ghost CMS with syntax highlighting (prism-react-renderer)
- **CDN**: BunnyCDN (media assets)
- **Contact**: EmailJS

## Quick Start

### Prerequisites

- **Bun** v1.0+ (recommended) or Node.js v18+

#### Installing Bun

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
irm bun.sh/install.ps1 | iex
```

### Installation

```bash
git clone https://github.com/oculairmedia/reactfolionew.git
cd reactfolionew

# Using Bun (recommended - much faster)
bun install --no-save

# Or using npm
npm install
```

### Environment Variables

Create a `.env` file:

```bash
VITE_API_URL=https://your-payload-cms.com/api
VITE_GHOST_URL=https://your-ghost-blog.com
VITE_GHOST_KEY=your_ghost_content_api_key
VITE_CDN_URL=https://your-cdn.com
```

### Development

```bash
# Using Bun (recommended)
bun run start          # Vite dev server on http://localhost:3000

# Using npm
npm start
```

### Production Build

```bash
# Using Bun
bun run build          # Syncs CMS content, then builds to build/

# Using npm
npm run build
```

## Development Environment

### Bun vs npm

| Task | Bun | npm |
|------|-----|-----|
| Install packages | `bun install --no-save` | `npm install` |
| Add package | `bun add <pkg>` | `npm install <pkg>` |
| Remove package | `bun remove <pkg>` | `npm uninstall <pkg>` |
| Run script | `bun run <script>` | `npm run <script>` |
| Dev server | `bun run start` | `npm start` |
| Build | `bun run build` | `npm run build` |

**Why Bun?**
- 5-10x faster package installation
- Faster script execution
- Native TypeScript support
- Drop-in replacement for npm

**Note**: On Windows network drives, use `bun install --no-save` to avoid lockfile issues.

### Available Scripts

```bash
bun run start              # Vite dev server
bun run build              # Sync content + production build
bun run preview            # Preview production build
bun run vercel-build       # Production build (Vercel)
bun run sync:content       # Sync CMS content to local JSON fallback
bun run test               # Run tests
bun run test:watch         # Run tests in watch mode
bun run test:e2e           # Run Playwright e2e tests
```

### IDE Setup

#### VS Code Extensions (Recommended)

- **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes
- **ES7+ React/Redux/React-Native** - React snippets
- **Prettier** - Code formatting
- **ESLint** - Linting
- **Bun for Visual Studio Code** - Bun support

#### Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["className\\s*=\\s*[\"'`]([^\"'`]*)[\"'`]"]
  ]
}
```

### Project Structure

```
personal-site/
├── public/                  # Static assets
├── src/
│   ├── app/                 # App shell, routes (TanStack Router)
│   ├── components/          # Shared React components
│   │   ├── BlogContent.tsx  # Blog HTML parser with code highlighting
│   │   ├── CodeBlock.tsx    # Syntax highlighting component
│   │   └── ...
│   ├── content/             # Fallback JSON (synced from CMS)
│   ├── features/            # Feature modules (layout)
│   ├── header/              # Site header
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Route page components
│   │   ├── blog/            # Blog pages
│   │   │   ├── index.tsx    # Blog listing
│   │   │   ├── BlogPost.tsx # Individual post
│   │   │   └── BlogPost.css # Blog styling
│   │   ├── portfolio/       # Portfolio pages
│   │   └── ...
│   ├── services/            # External API clients (Ghost)
│   └── utils/               # Helpers (CMS API, CDN, fallback)
├── payload/                 # Payload CMS collections & globals
├── scripts/                 # Build & migration scripts
├── bunfig.toml              # Bun configuration
├── vite.config.js           # Vite configuration
├── tailwind.config.cjs      # Tailwind CSS configuration
└── package.json
```

### Key Components

#### Blog System

- **BlogPost.tsx** - Main blog post page with breadcrumbs, TOC sidebar
- **BlogContent.tsx** - Parses Ghost HTML, extracts code blocks for highlighting
- **CodeBlock.tsx** - Syntax highlighting with copy button, line numbers
- **BlogPost.css** - Comprehensive blog styling (typography, code blocks, etc.)

#### Portfolio System

- **DynamicProjectPage.tsx** - Project detail pages with hero, sections, gallery
- **PortfolioItem.tsx** - Portfolio grid items
- **ProjectPage.css** - Brutalist design styling

### Styling

This project uses:

- **Tailwind CSS** - Utility-first CSS
- **daisyUI** - Component library for Tailwind
- **Custom CSS** - For complex components (blog content, project pages)

#### Theme System

daisyUI themes are configured in `tailwind.config.cjs`. The site supports light/dark mode.

#### CSS Variables

Custom CSS uses daisyUI's CSS variables:

```css
var(--color-base-100)      /* Background */
var(--color-base-content)  /* Text */
var(--color-primary)       /* Primary accent */
var(--font-mono)           /* Monospace font */
var(--font-heading)        /* Heading font */
var(--font-body)           /* Body font */
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

Blog posts are fetched from Ghost CMS via the Content API. Features:

- Automatic code syntax highlighting
- Table of contents generation
- Reading time calculation
- Author info display

### CMS-First with Fallback

1. **Primary**: Fetch from Payload CMS API at runtime
2. **Fallback**: If CMS is unavailable, use local JSON files from `src/content/`
3. **Sync**: `bun run sync:content` pulls CMS data into local JSON

### API Endpoints

```
GET /api/projects                           # All projects
GET /api/projects?where[id][equals]=<id>    # Single project
GET /api/portfolio                          # Portfolio items
GET /api/globals/site-settings              # Site settings
GET /api/globals/home-intro                 # Home intro
GET /api/globals/about-page                 # About page
```

## Troubleshooting

### Bun lockfile issues on Windows

If you see `EINVAL: Failed to replace old lockfile`, use:

```bash
bun install --no-save
```

This is a known issue with Windows network drives.

### Port already in use

Vite will automatically try the next available port. Or manually specify:

```bash
bun run start -- --port 3001
```

### CSS parsing errors

Check for:
- Windows line endings (CRLF) - run `sed -i 's/\r$//' <file>`
- Non-ASCII characters in CSS - use CSS escape sequences (e.g., `\2014` for em-dash)

### CMS sync failures

If `bun run build` fails due to CMS sync:
- Check `VITE_API_URL` is correct
- Ensure CMS server is running
- Fallback JSON in `src/content/` will be used if available

## Deployment

Frontend deploys to Vercel. Payload CMS runs as a remote server.

Set `VITE_API_URL` to point to your Payload server.

### Vercel Configuration

The `vercel-build` script handles production builds automatically.

## License

MIT

## Acknowledgments

- Original template by [@ubaimutl](https://github.com/ubaimutl)
- Enhanced with Payload CMS + Ghost integration
- Built by [Emmanuel Umukoro](https://github.com/oculairmedia) @ Oculair Media