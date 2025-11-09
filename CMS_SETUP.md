# Sveltia CMS Setup Guide

This guide will help you set up and deploy the Sveltia CMS for managing your portfolio content.

## Overview

This portfolio now includes [Sveltia CMS](https://github.com/sveltia/sveltia-cms), a modern, Git-based content management system. All content changes are committed directly to your GitHub repository, maintaining version control and enabling a JAMstack workflow.

## Features

- **Git-based**: All content stored in your repository
- **No database required**: Content lives as JSON/Markdown files
- **Version control**: Full history of all content changes
- **Media management**: Upload and manage images through the CMS
- **Live preview**: See changes before publishing
- **GitHub OAuth**: Secure authentication via GitHub

## Quick Start

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the application details:
   - **Application name**: `Reactfolio CMS` (or your preferred name)
   - **Homepage URL**: `https://your-vercel-url.vercel.app`
   - **Authorization callback URL**: `https://your-vercel-url.vercel.app/api/callback`
4. Click **"Register application"**
5. Copy the **Client ID** (you'll need this in step 2)
6. Click **"Generate a new client secret"**
7. Copy the **Client Secret** (you'll need this in step 2)

⚠️ **Important**: Keep your Client Secret secure and never commit it to your repository!

### 2. Configure Vercel Environment Variables

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add the following variables:

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `GITHUB_CLIENT_ID` | Your Client ID from step 1 | Production, Preview, Development |
   | `GITHUB_CLIENT_SECRET` | Your Client Secret from step 1 | Production, Preview, Development |

5. Click **"Save"** for each variable

### 3. Update CMS Configuration

Edit [/public/admin/config.yml](public/admin/config.yml) and update line 6:

```yaml
backend:
  name: github
  repo: oculairmedia/reactfolio  # Your GitHub username/repo
  branch: master
  base_url: https://your-actual-site.vercel.app  # ← Replace this
  auth_endpoint: /api/auth
```

Replace `https://your-actual-site.vercel.app` with your actual Vercel deployment URL.

### 4. Deploy to Vercel

#### Option A: Merge and Auto-Deploy (Recommended)

```bash
# Create a pull request
git push origin claude/sveltia-cms-implementation-011CUww9LxDZqbC72v2aZWUv

# Then merge the PR on GitHub
# Vercel will automatically deploy when merged to master
```

#### Option B: Manual Deployment

```bash
# Deploy directly from CLI
vercel --prod
```

### 5. Access Your CMS

Once deployed, access your CMS at:

```
https://your-site.vercel.app/admin
```

1. Click **"Login with GitHub"**
2. Authorize the OAuth app
3. Start managing your content!

---

## Content Structure

### Managed Content Files

The CMS manages content in the following locations:

```
src/content/
├── settings/
│   └── site-settings.json      # Site configuration, contact info, social links
├── intro/
│   └── home.json                # Home page intro and animated text
├── about/
│   └── about.json               # About page, timeline, skills, services
├── portfolio/
│   └── *.json                   # Portfolio items (grid view)
└── projects/
    └── *.md                     # Detailed project pages (markdown)
```

### Content Types

#### 1. Site Settings
- Logo text
- Site metadata (title, description)
- Contact configuration (EmailJS settings)
- Social media profiles

#### 2. Home Page
- Introduction title and description
- Profile image URL
- Animated typewriter phrases

#### 3. About Page
- About me text
- Work timeline/experience
- Skills with proficiency levels
- Services offered

#### 4. Portfolio Items
- Portfolio grid items
- Image or video thumbnails
- Brief descriptions
- Tags for filtering

#### 5. Project Pages
- Detailed project case studies
- Full markdown content
- Project metadata (client, year, role)
- Featured images
- Tags

---

## Architecture

### OAuth Flow

```
User → CMS Login → GitHub OAuth → Vercel Serverless Function → Access Token → CMS
```

### Vercel Serverless Functions

Located in `/api/`:

- [**auth.js**](api/auth.js) - Exchanges GitHub OAuth code for access token
- [**callback.js**](api/callback.js) - Handles OAuth redirect and sends user back to CMS

### CMS Files

Located in `/public/admin/`:

- [**index.html**](public/admin/index.html) - Loads Sveltia CMS
- [**config.yml**](public/admin/config.yml) - CMS configuration and content schema

---

## Troubleshooting

### Issue: "Failed to authenticate with GitHub"

**Solutions:**
1. Verify GitHub OAuth app credentials in Vercel environment variables
2. Ensure callback URL matches: `https://your-site.vercel.app/api/callback`
3. Check that `base_url` in `config.yml` matches your Vercel URL
4. Redeploy after changing environment variables

### Issue: "Repository not found"

**Solutions:**
1. Verify the `repo` setting in `/public/admin/config.yml` matches your GitHub repo
2. Ensure your GitHub account has write access to the repository
3. Check that the branch name is correct (usually `master` or `main`)

### Issue: CMS loads but can't save changes

**Solutions:**
1. Check browser console for errors
2. Verify GitHub OAuth token has `repo` scope permissions
3. Ensure the repository is not archived or read-only
4. Check that content folders exist (`src/content/settings/`, etc.)

### Issue: Environment variables not working

**Solutions:**
1. Ensure variables are set for all environments (Production, Preview, Development)
2. Redeploy after adding environment variables (they don't apply to existing deployments)
3. Clear Vercel build cache and redeploy

### Issue: OAuth callback fails

**Solutions:**
1. Double-check the callback URL in GitHub OAuth app settings
2. Ensure it matches: `https://your-site.vercel.app/api/callback` (no trailing slash)
3. Verify the Vercel deployment URL is correct

---

## Content Management Workflow

### Adding a New Portfolio Item

1. Go to `https://your-site.vercel.app/admin`
2. Click **"Portfolio Items"** in the sidebar
3. Click **"New Portfolio Item"**
4. Fill in the fields:
   - ID: Unique identifier (e.g., `my-awesome-project`)
   - Title: Project name
   - Description: Brief description
   - Image: Upload or provide URL
   - Tags: Add relevant tags
5. Click **"Publish"**
6. Changes are committed to GitHub automatically
7. Vercel rebuilds and deploys your site

### Creating a Detailed Project Page

1. Go to **"Project Pages"** in the CMS
2. Click **"New Project Page"**
3. Write your content in Markdown
4. Add metadata (title, client, year, role)
5. Upload featured image
6. Click **"Publish"**

### Updating Site Settings

1. Go to **"Site Settings"** → **"Site Configuration"**
2. Update your email, social links, or EmailJS credentials
3. Click **"Publish"**
4. Changes take effect on next deployment

---

## Security Best Practices

1. **Never commit secrets**: GitHub Client Secret should only exist in Vercel environment variables
2. **Limit OAuth app access**: Only grant repository access to trusted GitHub accounts
3. **Use environment-specific configs**: Set different OAuth apps for staging/production
4. **Enable branch protection**: Protect your `master` branch to prevent accidental overwrites
5. **Review commits**: Always review CMS-generated commits in your GitHub repo

---

## Advanced Configuration

### Custom Content Collections

To add new content types, edit [/public/admin/config.yml](public/admin/config.yml):

```yaml
collections:
  - name: "blog"  # Collection name
    label: "Blog Posts"  # Display name in CMS
    folder: "src/content/blog"  # Where files are stored
    create: true  # Allow creating new items
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"  # Filename pattern
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Date", name: "date", widget: "datetime" }
      - { label: "Body", name: "body", widget: "markdown" }
```

### Editorial Workflow (Draft/Review/Publish)

Enable pull request-based workflow in `config.yml`:

```yaml
publish_mode: editorial_workflow
```

This creates draft PRs for content changes instead of direct commits.

### Custom Media Storage

To use external CDN (BunnyCDN, Cloudinary, etc.):

```yaml
media_folder: "public/images"
public_folder: "https://your-cdn.com/images"
```

---

## Migration from content_option.js

The old [src/content_option.js](src/content_option.js) file is now deprecated. Content should be managed through:

1. **Site settings** → `src/content/settings/site-settings.json`
2. **Home intro** → `src/content/intro/home.json`
3. **About page** → `src/content/about/about.json`
4. **Portfolio items** → `src/content/portfolio/*.json`

Update your React components to import from these JSON files instead of `content_option.js`.

---

## Support

- **Sveltia CMS Docs**: https://github.com/sveltia/sveltia-cms
- **Vercel Docs**: https://vercel.com/docs
- **GitHub OAuth Docs**: https://docs.github.com/en/developers/apps/oauth-apps

---

## Summary Checklist

- [ ] Create GitHub OAuth App
- [ ] Copy Client ID and Client Secret
- [ ] Add environment variables in Vercel
- [ ] Update `base_url` in [/public/admin/config.yml](public/admin/config.yml)
- [ ] Deploy to Vercel
- [ ] Test CMS login at `/admin`
- [ ] Create test content to verify workflow

Once all steps are complete, you'll have a fully functional CMS for managing your portfolio content!
