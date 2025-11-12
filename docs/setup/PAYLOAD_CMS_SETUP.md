# Payload CMS Setup Guide

This guide will help you set up and use Payload CMS for managing your portfolio content.

## Overview

This portfolio now uses [Payload CMS](https://payloadcms.com/), a powerful, TypeScript-first headless CMS. Payload provides a full-featured admin panel, REST & GraphQL APIs, and robust content management capabilities with a MongoDB database.

## Features

- **Powerful Admin UI**: Modern, customizable admin interface
- **Type-safe**: Built with TypeScript for better developer experience
- **Database-backed**: Uses MongoDB for reliable data storage
- **REST & GraphQL APIs**: Flexible API options for frontend integration
- **Rich Text Editor**: Slate-based editor for content creation
- **Media Management**: Built-in file upload and management
- **Access Control**: Fine-grained permissions and authentication
- **Extensible**: Highly customizable with hooks and custom components

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (local installation or MongoDB Atlas account)
3. **npm** or **yarn** package manager

## Setup Instructions

### 1. Install MongoDB

#### Option A: MongoDB Atlas (Cloud - Recommended for Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `<dbname>` with `portfolio`

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
```

#### Option B: Local MongoDB

1. Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # macOS
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows
   # MongoDB runs as a service automatically
   ```
3. Verify it's running on `mongodb://localhost:27017`

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the following variables in `.env`:

   ```env
   # Generate a secure secret (32+ characters)
   PAYLOAD_SECRET=your_very_long_and_secure_secret_key_here

   # MongoDB connection string
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
   # Or for local: mongodb://localhost:27017/portfolio

   # Server URLs
   PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
   REACT_APP_API_URL=http://localhost:3001/api
   ```

3. Generate a secure secret key:
   ```bash
   openssl rand -base64 32
   ```

### 3. Start the Payload CMS Server

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Start the Payload server:
   ```bash
   npm run payload
   ```

3. Access the admin panel at: `http://localhost:3001/admin`

### 4. Create Your First Admin User

1. Navigate to `http://localhost:3001/admin`
2. You'll see the "Create First User" screen
3. Fill in:
   - **Name**: Your name
   - **Email**: Your email address
   - **Password**: Strong password (8+ characters)
   - **Confirm Password**: Same password
4. Click "Create"

You're now logged in and can start managing content!

---

## Content Structure

### Collections

#### 1. **Users**
- Admin users who can access the CMS
- Authentication and authorization

#### 2. **Projects**
Detailed project case studies with:
- Project metadata (client, date, role, technologies)
- Hero image or video
- Project sections with rich content
- Gallery with images and videos
- Tags for categorization

#### 3. **Portfolio**
Portfolio grid items with:
- Thumbnail image or video
- Short description
- Link to detailed project page
- Tags for filtering

#### 4. **Media**
- Image and video uploads
- Alt text and captions
- Automatic file management

### Globals (Site-wide Settings)

#### 1. **Site Settings**
- Logo text
- Site metadata (title, description)
- Contact information and EmailJS configuration
- Social media links

#### 2. **Home Intro**
- Introduction title and description
- Profile image
- Animated typewriter phrases

#### 3. **About Page**
- About me text
- Work timeline/experience
- Skills with proficiency levels
- Services offered

---

## Using the CMS

### Adding a New Project

1. Go to `http://localhost:3001/admin`
2. Click **"Projects"** in the sidebar
3. Click **"Create New"**
4. Fill in the project details:
   - **ID**: Unique identifier (e.g., `my-awesome-project`)
   - **Title**: Project name
   - **Subtitle**: Optional subtitle
   - **Metadata**: Client, date, role, technologies
   - **Hero**: Choose image or video, add URL
   - **Tags**: Add relevant tags
   - **Sections**: Add content sections
   - **Gallery**: Add project images/videos
5. Click **"Save"**

### Adding a Portfolio Item

1. Click **"Portfolio"** in the sidebar
2. Click **"Create New"**
3. Fill in:
   - **ID**: Should match a project ID
   - **Title**: Project name
   - **Description**: Brief description for grid
   - **Image/Video**: Thumbnail or video URL
   - **Link**: Link to detailed project page
   - **Tags**: Add tags
4. Click **"Save"**

### Updating Site Settings

1. Click **"Globals"** → **"Site Settings"**
2. Update any fields:
   - Logo text
   - Site title and description
   - Contact email
   - Social media links
3. Click **"Save"**

### Updating Home Page

1. Click **"Globals"** → **"Home Intro"**
2. Update:
   - Title and description
   - Profile image URL
   - Animated phrases (add, edit, or remove)
3. Click **"Save"**

### Updating About Page

1. Click **"Globals"** → **"About Page"**
2. Update:
   - About me text
   - Timeline entries
   - Skills (name and proficiency level)
   - Services offered
3. Click **"Save"**

---

## Frontend Integration

### Fetching Data from Payload API

Payload automatically generates REST and GraphQL APIs for all your collections and globals.

#### REST API Endpoints

**Collections:**
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `GET /api/portfolio` - Get all portfolio items
- `GET /api/portfolio/:id` - Get single portfolio item

**Globals:**
- `GET /api/globals/site-settings` - Get site settings
- `GET /api/globals/home-intro` - Get home intro
- `GET /api/globals/about-page` - Get about page

#### Example: Fetching Projects

```javascript
// Fetch all projects
const response = await fetch('http://localhost:3001/api/projects');
const data = await response.json();
console.log(data.docs); // Array of projects

// Fetch single project by ID
const response = await fetch('http://localhost:3001/api/projects?where[id][equals]=binmetrics');
const data = await response.json();
console.log(data.docs[0]); // Single project
```

#### Example: Fetching Global Settings

```javascript
// Fetch site settings
const response = await fetch('http://localhost:3001/api/globals/site-settings');
const data = await response.json();
console.log(data); // Site settings object

// Fetch home intro
const response = await fetch('http://localhost:3001/api/globals/home-intro');
const data = await response.json();
console.log(data.animated); // Array of animated phrases
```

#### React Component Example

```jsx
import { useEffect, useState } from 'react';

function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/projects`
        );
        const data = await response.json();
        setProjects(data.docs);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {projects.map((project) => (
        <div key={project.id}>
          <h2>{project.title}</h2>
          <p>{project.subtitle}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Deployment

### Development

```bash
# Terminal 1: Run the React frontend
npm start

# Terminal 2: Run the Payload CMS backend
npm run payload
```

### Production

#### Option 1: Deploy Both Services Separately

**Frontend (Vercel):**
1. Build the React app: `npm run build`
2. Deploy to Vercel as usual
3. Set environment variable: `REACT_APP_API_URL=https://your-payload-api.com/api`

**Backend (Railway, Heroku, or DigitalOcean):**
1. Build the server: `npm run payload:build`
2. Deploy the `dist` folder
3. Set environment variables:
   - `PAYLOAD_SECRET`
   - `MONGODB_URI`
   - `PAYLOAD_PUBLIC_SERVER_URL`

#### Option 2: Deploy Together (Vercel with Serverless)

This requires additional configuration to run Payload in serverless mode on Vercel.

---

## API Query Parameters

Payload provides powerful querying capabilities:

### Filtering

```javascript
// Get projects with specific tag
/api/projects?where[tags][contains]=UX/UI

// Get projects by client
/api/projects?where[metadata.client][equals]=Bin Metrics
```

### Sorting

```javascript
// Sort by title ascending
/api/projects?sort=title

// Sort by date descending
/api/projects?sort=-metadata.date
```

### Pagination

```javascript
// Get first 10 projects
/api/projects?limit=10&page=1

// Get next 10 projects
/api/projects?limit=10&page=2
```

### Field Selection

```javascript
// Only return specific fields
/api/projects?select=id,title,subtitle
```

---

## Migrating Existing Content

To migrate your existing JSON content to Payload CMS:

1. Start the Payload server: `npm run payload`
2. Create migration scripts or manually add content via the admin UI
3. Use the REST API to bulk import:

```javascript
// Example migration script
const fs = require('fs');
const fetch = require('node-fetch');

const projects = JSON.parse(fs.readFileSync('src/content/projects/binmetrics.json'));

async function migrateProject(project) {
  const response = await fetch('http://localhost:3001/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `JWT ${yourAuthToken}`,
    },
    body: JSON.stringify(project),
  });
  return response.json();
}
```

---

## Troubleshooting

### Issue: Cannot connect to MongoDB

**Solutions:**
1. Verify MongoDB is running: `mongosh` (should connect without errors)
2. Check `MONGODB_URI` in `.env` file
3. For MongoDB Atlas:
   - Whitelist your IP address in Network Access
   - Verify username and password
   - Ensure connection string has correct format

### Issue: "Invalid secret" error

**Solutions:**
1. Ensure `PAYLOAD_SECRET` is set in `.env`
2. Secret must be at least 32 characters
3. Restart the server after changing environment variables

### Issue: Admin panel won't load

**Solutions:**
1. Check if server is running: `http://localhost:3001/admin`
2. Check browser console for errors
3. Clear browser cache and cookies
4. Verify no port conflicts (3001 is available)

### Issue: Cannot create first user

**Solutions:**
1. Check MongoDB connection
2. Ensure database is accessible
3. Check server logs for errors
4. Verify all required fields are filled

### Issue: CORS errors when accessing API

**Solutions:**
1. Ensure `CORS` is configured in `payload/config.ts`
2. Add your frontend URL to allowed origins
3. Check that API URL is correct in frontend

---

## Security Best Practices

1. **Keep secrets secure**: Never commit `.env` file to version control
2. **Use strong passwords**: For MongoDB and admin users
3. **Enable authentication**: Protect your API endpoints
4. **Use HTTPS**: In production, always use HTTPS
5. **Regular backups**: Backup your MongoDB database regularly
6. **Update dependencies**: Keep Payload and dependencies up to date
7. **Environment separation**: Use different databases for dev/staging/production

---

## Additional Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Payload GitHub](https://github.com/payloadcms/payload)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Atlas Tutorial](https://docs.atlas.mongodb.com/getting-started/)

---

## Support

For issues specific to this implementation, check:
- Server logs when running `npm run payload`
- Browser console for frontend errors
- MongoDB logs for database issues

For Payload CMS questions:
- [Payload Discord Community](https://discord.com/invite/payload)
- [Payload GitHub Issues](https://github.com/payloadcms/payload/issues)

---

## Quick Reference

### Common Commands

```bash
# Start Payload CMS server (development)
npm run payload

# Build Payload server for production
npm run payload:build

# Run production build
npm run payload:serve

# Start React frontend
npm start

# Build React frontend
npm run build

# Generate secure secret
openssl rand -base64 32
```

### Environment Variables

```env
PAYLOAD_SECRET=                 # 32+ character secret key
MONGODB_URI=                    # MongoDB connection string
PAYLOAD_PUBLIC_SERVER_URL=      # Payload server URL
REACT_APP_API_URL=              # API URL for frontend
```

---

## Summary Checklist

- [ ] Install MongoDB (local or Atlas)
- [ ] Copy `.env.example` to `.env`
- [ ] Update `PAYLOAD_SECRET` with secure key
- [ ] Update `MONGODB_URI` with connection string
- [ ] Run `npm install`
- [ ] Start Payload server: `npm run payload`
- [ ] Access admin at `http://localhost:3001/admin`
- [ ] Create first admin user
- [ ] Add your portfolio content
- [ ] Update frontend to fetch from Payload API
- [ ] Test the integration
- [ ] Deploy to production

Once complete, you'll have a fully functional CMS with a powerful admin interface and flexible API!
