# Migration Guide: From Sveltia CMS to Payload CMS

This guide helps you migrate your existing portfolio content from Sveltia CMS (Git-based) to Payload CMS (database-backed).

## Why Migrate to Payload CMS?

### Advantages of Payload CMS

1. **Database-Backed**: More scalable and performant than Git-based storage
2. **Real-time Updates**: Changes appear instantly without Git commits
3. **Better Performance**: No need to rebuild/redeploy for content changes
4. **Powerful Querying**: Advanced filtering, sorting, and searching
5. **Rich Admin UI**: More features and better user experience
6. **REST & GraphQL APIs**: Multiple API options for flexibility
7. **Media Management**: Built-in file upload and storage
8. **Extensibility**: Easier to add custom features and integrations

### Trade-offs

- **Requires Database**: Need MongoDB (free tier available on Atlas)
- **Separate Backend**: Needs a backend server (can be serverless)
- **Migration Effort**: One-time effort to move existing content

## Migration Process

### Phase 1: Setup (30 minutes)

1. **Install MongoDB**
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (recommended - free tier)
   - Or local MongoDB installation

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```

   Update in `.env`:
   ```env
   PAYLOAD_SECRET=<generate with: openssl rand -base64 32>
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
   PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
   REACT_APP_API_URL=http://localhost:3001/api
   ```

3. **Start Payload Server**
   ```bash
   npm run payload
   ```

4. **Create Admin User**
   - Go to `http://localhost:3001/admin`
   - Fill in the "Create First User" form
   - Remember your credentials!

### Phase 2: Content Migration (1-2 hours)

You can migrate content either manually or programmatically.

#### Option A: Manual Migration via Admin UI (Recommended for Small Sites)

**1. Migrate Site Settings**

From: `src/content/settings/site-settings.json`
To: Payload Admin → Globals → Site Settings

Copy each field from the JSON file to the corresponding field in Payload.

**2. Migrate Home Intro**

From: `src/content/intro/home.json`
To: Payload Admin → Globals → Home Intro

1. Copy title and description
2. Copy image URL
3. Add each animated phrase (click "Add Animated" for each)

**3. Migrate About Page**

From: `src/content/about/about.json`
To: Payload Admin → Globals → About Page

1. Copy title and about text
2. Add timeline entries (click "Add Timeline" for each)
3. Add skills (click "Add Skills" for each)
4. Add services (click "Add Services" for each)

**4. Migrate Projects**

From: `src/content/projects/*.json`
To: Payload Admin → Collections → Projects

For each project file:
1. Click "Create New" in Projects collection
2. Copy all fields from JSON to Payload form
3. Pay attention to nested structures (metadata, hero, sections, gallery)
4. Click "Save"

Repeat for all 11 projects.

**5. Migrate Portfolio Items**

From: `src/content/portfolio/*.json`
To: Payload Admin → Collections → Portfolio

For each portfolio file:
1. Click "Create New" in Portfolio collection
2. Copy all fields from JSON to Payload form
3. Ensure the ID matches the corresponding project
4. Click "Save"

Repeat for all 11 portfolio items.

#### Option B: Programmatic Migration (Recommended for Large Sites)

Create a migration script to automatically import all content:

```javascript
// migrate-to-payload.js
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api';
let authToken = '';

// Step 1: Login to get JWT token
async function login() {
  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'your-email@example.com',
      password: 'your-password',
    }),
  });
  const data = await response.json();
  authToken = data.token;
  console.log('✓ Logged in successfully');
}

// Step 2: Migrate Site Settings
async function migrateSiteSettings() {
  const settingsPath = './src/content/settings/site-settings.json';
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

  const response = await fetch(`${API_URL}/globals/site-settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `JWT ${authToken}`,
    },
    body: JSON.stringify(settings),
  });

  if (response.ok) {
    console.log('✓ Migrated site settings');
  } else {
    console.error('✗ Failed to migrate site settings');
  }
}

// Step 3: Migrate Home Intro
async function migrateHomeIntro() {
  const introPath = './src/content/intro/home.json';
  const intro = JSON.parse(fs.readFileSync(introPath, 'utf-8'));

  const response = await fetch(`${API_URL}/globals/home-intro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `JWT ${authToken}`,
    },
    body: JSON.stringify(intro),
  });

  if (response.ok) {
    console.log('✓ Migrated home intro');
  } else {
    console.error('✗ Failed to migrate home intro');
  }
}

// Step 4: Migrate About Page
async function migrateAboutPage() {
  const aboutPath = './src/content/about/about.json';
  const about = JSON.parse(fs.readFileSync(aboutPath, 'utf-8'));

  const response = await fetch(`${API_URL}/globals/about-page`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `JWT ${authToken}`,
    },
    body: JSON.stringify(about),
  });

  if (response.ok) {
    console.log('✓ Migrated about page');
  } else {
    console.error('✗ Failed to migrate about page');
  }
}

// Step 5: Migrate Projects
async function migrateProjects() {
  const projectsDir = './src/content/projects';
  const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const projectPath = path.join(projectsDir, file);
    const project = JSON.parse(fs.readFileSync(projectPath, 'utf-8'));

    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${authToken}`,
      },
      body: JSON.stringify(project),
    });

    if (response.ok) {
      console.log(`✓ Migrated project: ${project.id}`);
    } else {
      console.error(`✗ Failed to migrate project: ${project.id}`);
    }
  }
}

// Step 6: Migrate Portfolio Items
async function migratePortfolio() {
  const portfolioDir = './src/content/portfolio';
  const files = fs.readdirSync(portfolioDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const itemPath = path.join(portfolioDir, file);
    const item = JSON.parse(fs.readFileSync(itemPath, 'utf-8'));

    const response = await fetch(`${API_URL}/portfolio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${authToken}`,
      },
      body: JSON.stringify(item),
    });

    if (response.ok) {
      console.log(`✓ Migrated portfolio item: ${item.id}`);
    } else {
      console.error(`✗ Failed to migrate portfolio item: ${item.id}`);
    }
  }
}

// Run migration
async function runMigration() {
  console.log('Starting migration to Payload CMS...\n');

  await login();
  await migrateSiteSettings();
  await migrateHomeIntro();
  await migrateAboutPage();
  await migrateProjects();
  await migratePortfolio();

  console.log('\n✓ Migration completed!');
}

runMigration().catch(console.error);
```

**To use the migration script:**

1. Save the script as `migrate-to-payload.js` in the project root
2. Update the email and password in the `login()` function
3. Ensure Payload server is running: `npm run payload`
4. Run the script: `node migrate-to-payload.js`

### Phase 3: Update Frontend Code (30 minutes - 1 hour)

Replace hard-coded JSON imports with Payload API calls.

**Before (JSON files):**
```javascript
import projectData from '../content/projects/binmetrics.json';
```

**After (Payload API):**
```javascript
import { getProjectById } from '../utils/payloadApi';

const project = await getProjectById('binmetrics');
```

#### Update React Components

**Example: Home Page**

Before:
```javascript
import homeData from '../content/intro/home.json';

function Home() {
  return (
    <div>
      <h1>{homeData.title}</h1>
      <p>{homeData.description}</p>
    </div>
  );
}
```

After:
```javascript
import { useEffect, useState } from 'react';
import { getHomeIntro } from '../utils/payloadApi';

function Home() {
  const [homeData, setHomeData] = useState(null);

  useEffect(() => {
    getHomeIntro().then(data => setHomeData(data));
  }, []);

  if (!homeData) return <div>Loading...</div>;

  return (
    <div>
      <h1>{homeData.title}</h1>
      <p>{homeData.description}</p>
    </div>
  );
}
```

**Example: Projects List**

Before:
```javascript
import project1 from '../content/projects/binmetrics.json';
import project2 from '../content/projects/branton.json';
// ... more imports

const projects = [project1, project2, ...];
```

After:
```javascript
import { useEffect, useState } from 'react';
import { getProjects } from '../utils/payloadApi';

function ProjectsList() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getProjects().then(data => setProjects(data));
  }, []);

  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

**Example: Single Project Page**

Before:
```javascript
import { useParams } from 'react-router-dom';
import project from '../content/projects/binmetrics.json';
```

After:
```javascript
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectById } from '../utils/payloadApi';

function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    getProjectById(id).then(data => setProject(data));
  }, [id]);

  if (!project) return <div>Loading...</div>;

  return (
    <div>
      <h1>{project.title}</h1>
      {/* ... rest of component */}
    </div>
  );
}
```

### Phase 4: Testing (30 minutes)

1. **Test All Pages**
   - Home page loads correctly
   - About page displays all content
   - Portfolio grid shows all items
   - Individual project pages work
   - Contact form still works

2. **Test Admin Panel**
   - Login works
   - Can create new project
   - Can edit existing project
   - Can update global settings
   - Changes appear on frontend

3. **Test API Endpoints**
   ```bash
   # Test in browser or with curl
   curl http://localhost:3001/api/projects
   curl http://localhost:3001/api/globals/site-settings
   ```

### Phase 5: Deployment (varies)

#### Development Setup
```bash
# Terminal 1: React frontend
npm start

# Terminal 2: Payload backend
npm run payload
```

#### Production Deployment

**Option 1: Separate Services**
- Deploy React frontend to Vercel
- Deploy Payload backend to Railway/Heroku/DigitalOcean
- Update `REACT_APP_API_URL` to point to backend

**Option 2: Vercel Serverless** (advanced)
- Requires additional Payload configuration
- See Payload docs for serverless setup

### Phase 6: Cleanup (optional)

Once everything is working with Payload:

1. **Archive old CMS files:**
   ```bash
   mkdir archive
   mv public/admin archive/
   mv api/auth.js api/callback.js archive/
   ```

2. **Remove old content files** (keep as backup initially):
   ```bash
   # Don't delete yet - keep as reference
   # After confirming everything works, you can remove:
   # rm -rf src/content
   ```

3. **Update documentation:**
   - Archive `CMS_SETUP.md` and `CMS_GUIDE.md`
   - Point team to `PAYLOAD_CMS_SETUP.md`

## Troubleshooting Migration

### Data Structure Differences

**Tags:**
- **Old format**: `["tag1", "tag2"]`
- **New format**: `[{tag: "tag1"}, {tag: "tag2"}]`

**Solution**: Transform during migration or update collection schema

**Images:**
- **Old**: Direct URLs in JSON
- **New**: Can use URLs or upload to Payload Media collection

### Common Issues

**Issue: Auth token expired during migration**
- Re-run `login()` function
- Use longer timeout for token

**Issue: Validation errors**
- Check required fields match
- Verify data types (string, number, array, etc.)
- Look at Payload server logs for details

**Issue: Frontend still shows old data**
- Clear browser cache
- Check API URL is correct
- Verify Payload server is running

## Rollback Plan

If you need to rollback:

1. Keep old JSON files (don't delete)
2. Keep old CMS configuration
3. Git commit before making changes
4. Can revert frontend code changes
5. Can switch back to Sveltia CMS if needed

## Post-Migration Benefits

Once migrated, you'll enjoy:

1. **Faster content updates** - no Git commits needed
2. **Better content management** - rich admin interface
3. **More flexibility** - powerful querying and filtering
4. **Better scalability** - database-backed storage
5. **Easier collaboration** - multiple users can edit simultaneously

## Support

Having issues with migration?

1. Check Payload server logs
2. Test API endpoints directly
3. Review this guide
4. Check [Payload documentation](https://payloadcms.com/docs)
5. Ask in [Payload Discord](https://discord.com/invite/payload)

---

Good luck with your migration! 🚀
