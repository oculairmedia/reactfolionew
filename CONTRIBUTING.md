# Contributing to Personal Site

## Development Environment Setup

### Prerequisites

#### Required

- **Bun** v1.0+ (recommended) or Node.js v18+
- **Git**

#### Optional

- **VS Code** (recommended editor)
- **Payload CMS** (for content management)
- **Ghost CMS** (for blog)

### Installing Bun

Bun is a fast JavaScript runtime that replaces Node.js + npm.

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell as Administrator)
irm bun.sh/install.ps1 | iex

# Verify installation
bun --version
```

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/oculairmedia/reactfolionew.git
cd reactfolionew

# Install dependencies with Bun
bun install --no-save

# Or with npm (slower)
npm install
```

### Environment Configuration

Create a `.env` file in the project root:

```env
# Payload CMS
VITE_API_URL=https://your-payload-cms.com/api

# Ghost Blog
VITE_GHOST_URL=https://your-ghost-blog.com
VITE_GHOST_KEY=your_ghost_content_api_key

# CDN (optional)
VITE_CDN_URL=https://your-cdn.com

# EmailJS (for contact form)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### Running the Dev Server

```bash
# Start development server
bun run start

# Server runs at http://localhost:3000
# Hot module replacement is enabled
```

---

## Development Workflow

### Daily Commands

| Command | Description |
|---------|-------------|
| `bun run start` | Start dev server |
| `bun run build` | Production build |
| `bun run preview` | Preview production build |
| `bun run test` | Run tests |
| `bun run test:watch` | Run tests in watch mode |

### Package Management

```bash
# Add a package
bun add <package-name>

# Add a dev dependency
bun add -d <package-name>

# Remove a package
bun remove <package-name>

# Update all packages
bun update
```

### Type Checking

```bash
# Run TypeScript compiler
npx tsc --noEmit
```

---

## Code Style

### Formatting

This project uses Prettier for code formatting. Format on save is recommended.

```bash
# Format all files
npx prettier --write .
```

### Linting

ESLint is configured for React and TypeScript.

```bash
# Run linter
npx eslint src/
```

### Naming Conventions

- **Components**: PascalCase (`BlogPost.tsx`)
- **Hooks**: camelCase with `use` prefix (`useScrollPosition.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **CSS**: kebab-case (`.blog-article-content`)
- **CSS Variables**: `--color-*`, `--font-*` prefix

### Component Structure

```tsx
// 1. Imports
import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import "./Component.css";

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
  children: React.ReactNode;
}

// 3. Component
const Component: React.FC<ComponentProps> = ({ title, children }) => {
  // 3a. Hooks
  const [state, setState] = useState(false);

  // 3b. Effects
  useEffect(() => {
    // ...
  }, []);

  // 3c. Handlers
  const handleClick = () => {
    setState(true);
  };

  // 3d. Render helpers
  const renderContent = () => {
    return <div>{children}</div>;
  };

  // 3e. Main render
  return (
    <div className="component">
      <h1>{title}</h1>
      {renderContent()}
    </div>
  );
};

export default Component;
```

---

## Styling Guidelines

### Tailwind CSS

Use Tailwind utility classes for most styling:

```tsx
<div className="flex items-center gap-4 p-6 bg-base-200 border-2 border-base-content/10">
  <h2 className="font-heading text-2xl font-bold uppercase tracking-tight">
    Title
  </h2>
</div>
```

### daisyUI Components

Use daisyUI components where appropriate:

```tsx
<button className="btn btn-primary">Click Me</button>
<div className="card bg-base-200">...</div>
<div className="breadcrumbs">...</div>
```

### Custom CSS

For complex components, use dedicated CSS files:

```css
/* ComponentName.css */

.component-name {
  /* Use CSS variables for theming */
  background-color: var(--color-base-100);
  color: var(--color-base-content);
  font-family: var(--font-body);
}

/* Use BEM-like naming */
.component-name__header {
  /* ... */
}

.component-name--variant {
  /* ... */
}
```

### Theme Compatibility

Always use daisyUI CSS variables for colors to support light/dark themes:

```css
/* ✅ Good - works with themes */
color: var(--color-base-content);
background-color: var(--color-base-200);

/* ❌ Bad - breaks theming */
color: #333;
background-color: white;
```

---

## Project Architecture

### Directory Structure

```
src/
├── app/                    # App shell, router setup
├── components/             # Shared components
│   ├── BlogContent.tsx     # Blog HTML parser
│   ├── CodeBlock.tsx       # Syntax highlighting
│   └── ...
├── content/                # Fallback JSON data
├── features/               # Feature modules
├── header/                 # Site header
├── hooks/                  # Custom React hooks
├── pages/                  # Route pages
│   ├── blog/               # Blog pages
│   ├── portfolio/          # Portfolio pages
│   └── ...
├── services/               # External API clients
└── utils/                  # Helper functions
```

### Key Patterns

#### CMS-First with Fallback

```tsx
// Fetch from CMS, fallback to local JSON
const data = await getFromCMS() || getLocalFallback();
```

#### Code Splitting

Pages are lazy-loaded via TanStack Router.

#### CSS Modules vs Global CSS

- Use Tailwind for most styling
- Use CSS files for complex component-specific styles
- Global styles go in `src/index.css`

---

## Testing

### Unit Tests

```bash
# Run all tests
bun run test

# Watch mode
bun run test:watch

# With UI
bun run test:ui
```

### E2E Tests

```bash
# Run Playwright tests
bun run test:e2e

# Update snapshots
bun run test:e2e:update
```

---

## Troubleshooting

### Bun Issues

**Lockfile errors on Windows:**
```bash
bun install --no-save
```

**Command not found:**
```bash
# Add to PATH
export PATH="$HOME/.bun/bin:$PATH"
```

### CSS Issues

**Parsing errors:**
- Check for Windows line endings: `sed -i 's/\r$//' file.css`
- Check for non-ASCII characters

**Styles not applying:**
- Check Tailwind classes are valid
- Verify CSS file is imported
- Check for specificity conflicts

### Build Issues

**CMS sync failures:**
- Verify `VITE_API_URL` is set
- Check CMS server is running
- Local fallback JSON will be used

**TypeScript errors:**
```bash
npx tsc --noEmit
```

---

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run tests: `bun run test`
4. Run type check: `npx tsc --noEmit`
5. Commit with descriptive message
6. Push and create PR

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(blog): add syntax highlighting for code blocks
fix(portfolio): correct image aspect ratio on mobile
docs: update README with Bun instructions
```

---

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [daisyUI Components](https://daisyui.com/components/)
- [TanStack Router](https://tanstack.com/router/latest)
- [Payload CMS](https://payloadcms.com/docs)
- [Ghost Content API](https://ghost.org/docs/content-api/)