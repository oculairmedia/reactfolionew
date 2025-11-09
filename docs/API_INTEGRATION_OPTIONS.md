# API Integration Options for Portfolio CMS

This document outlines various options for connecting the portfolio CMS over an API, moving from the current static build approach to a more dynamic, API-driven architecture.

## Current Architecture

**Git-Based CMS (Sveltia CMS)**
- Content stored as JSON files in `/src/content/`
- Changes committed directly to GitHub
- Vercel auto-deploys on commit
- Static build with bundled content
- Zero runtime data fetching

**Pros:**
- ✅ Simple deployment (just git push)
- ✅ Version control for all content
- ✅ Fast page loads (pre-rendered)
- ✅ No database required
- ✅ No API server maintenance

**Cons:**
- ❌ Requires full rebuild for content changes
- ❌ No real-time updates
- ❌ Cannot filter/search without loading all content
- ❌ Manual imports required (now automated with our improvements)

---

## Option 1: Headless CMS with API (Recommended for Scale)

### Approach A: Strapi (Open Source)

**Architecture:**
```
Client (React) <---> Strapi API <---> Database (PostgreSQL/MySQL/SQLite)
                         |
                         v
                    BunnyCDN (Media)
```

**Implementation:**
1. **Setup Strapi Backend:**
   ```bash
   npx create-strapi-app@latest portfolio-cms --quickstart
   ```

2. **Define Content Types:**
   - Portfolio Items (grid cards)
   - Project Pages (detailed content)
   - Site Settings
   - Navigation

3. **Deploy Options:**
   - Railway.app (free tier available)
   - Heroku
   - DigitalOcean App Platform
   - Self-hosted VPS

4. **Frontend Integration:**
   ```javascript
   // Example API fetch
   async function getProjects() {
     const response = await fetch('https://api.yoursite.com/api/projects?populate=*');
     const data = await response.json();
     return data.data;
   }
   ```

**Cost Estimate:**
- Strapi Cloud: $9/month (Starter)
- Self-hosted: $5-12/month (VPS)
- Database: Included with hosting or $0 (SQLite)

**Pros:**
- ✅ Real-time content updates (no rebuild)
- ✅ RESTful + GraphQL APIs
- ✅ Rich admin interface
- ✅ Media management
- ✅ Role-based access control
- ✅ Webhooks for automation

**Cons:**
- ❌ Requires separate backend infrastructure
- ❌ Additional hosting costs
- ❌ More complex deployment
- ❌ Requires database management

---

### Approach B: Sanity.io

**Architecture:**
```
Client (React) <---> Sanity API <---> Sanity Cloud
                         |
                         v
                    Sanity CDN (Media)
```

**Implementation:**
1. **Initialize Sanity:**
   ```bash
   npm install -g @sanity/cli
   sanity init
   ```

2. **Define Schemas:**
   ```javascript
   // schemas/project.js
   export default {
     name: 'project',
     type: 'document',
     fields: [
       {name: 'title', type: 'string'},
       {name: 'slug', type: 'slug'},
       {name: 'content', type: 'array', of: [{type: 'block'}]},
       {name: 'gallery', type: 'array', of: [{type: 'image'}]}
     ]
   }
   ```

3. **Frontend Integration:**
   ```javascript
   import {createClient} from '@sanity/client'

   const client = createClient({
     projectId: 'your-project-id',
     dataset: 'production',
     apiVersion: '2024-01-01',
     useCdn: true
   })

   const projects = await client.fetch('*[_type == "project"]')
   ```

**Cost Estimate:**
- Free tier: 3 users, unlimited API requests
- Growth: $99/month
- Team: $499/month

**Pros:**
- ✅ Generous free tier
- ✅ Real-time collaboration
- ✅ Powerful GROQ query language
- ✅ Built-in CDN
- ✅ Excellent developer experience
- ✅ Portable Content (structured content)

**Cons:**
- ❌ Learning curve (GROQ)
- ❌ Vendor lock-in
- ❌ Can get expensive at scale

---

### Approach C: Contentful

**Similar to Sanity but more enterprise-focused:**
- Free tier: 1 space, 25,000 records
- Team: $489/month
- Premium: Custom pricing

**Best for:** Teams needing advanced workflows and multi-brand support.

---

## Option 2: GitHub as API (Current Enhancement)

### GitHub REST/GraphQL API

**Architecture:**
```
Client (React) <---> GitHub API <---> GitHub Repo (JSON files)
```

**Implementation:**
```javascript
// Fetch content from GitHub API
async function getProject(slug) {
  const response = await fetch(
    `https://api.github.com/repos/oculairmedia/reactfolionew/contents/src/content/projects/${slug}.json`,
    {
      headers: {
        'Authorization': `token ${process.env.REACT_APP_GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  );
  const data = await response.json();
  const content = JSON.parse(atob(data.content));
  return content;
}
```

**With React (SWR for caching):**
```javascript
import useSWR from 'swr';

function DynamicProject({ slug }) {
  const { data, error } = useSWR(
    `/api/projects/${slug}`,
    () => fetchFromGitHub(slug),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  return <ProjectContent data={data} />;
}
```

**Pros:**
- ✅ No additional infrastructure
- ✅ Free (5,000 requests/hour)
- ✅ Keep Git-based workflow
- ✅ Version control benefits
- ✅ Works with current Sveltia CMS

**Cons:**
- ❌ Rate limits (5,000/hour authenticated)
- ❌ Slower than dedicated CMS
- ❌ Not designed for high-traffic sites
- ❌ Still requires client-side fetching

---

## Option 3: Hybrid - Incremental Static Regeneration (ISR)

### Next.js with ISR

**Architecture:**
```
Next.js (SSG/ISR) <---> Git/Headless CMS <---> Vercel Edge Network
```

**Migration Required:** React → Next.js

**Implementation:**
```javascript
// pages/projects/[slug].js
export async function getStaticProps({ params }) {
  const project = await fetchProject(params.slug);

  return {
    props: { project },
    revalidate: 60 // Rebuild every 60 seconds if requested
  }
}

export async function getStaticPaths() {
  const projects = await getAllProjects();

  return {
    paths: projects.map(p => ({ params: { slug: p.id } })),
    fallback: 'blocking'
  }
}
```

**Pros:**
- ✅ Best of both worlds (static + dynamic)
- ✅ Fast page loads
- ✅ Automatic rebuilds
- ✅ On-demand revalidation
- ✅ Excellent SEO

**Cons:**
- ❌ Requires migration to Next.js
- ❌ More complex caching logic
- ❌ Vercel-specific features

---

## Option 4: Serverless API with Vercel Functions

### Custom API on Vercel

**Architecture:**
```
Client (React) <---> Vercel Functions <---> GitHub/Database
                           |
                           v
                      Edge Cache
```

**Implementation:**
```javascript
// api/projects/[slug].js
export default async function handler(req, res) {
  const { slug } = req.query;

  // Fetch from GitHub or database
  const project = await getProjectData(slug);

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json(project);
}
```

**Frontend:**
```javascript
const { data } = useSWR(`/api/projects/${slug}`, fetcher);
```

**Pros:**
- ✅ No separate backend deployment
- ✅ Auto-scaling
- ✅ Can add caching layer
- ✅ Keep current React setup

**Cons:**
- ❌ Cold start latency
- ❌ Function execution limits
- ❌ More complex debugging

---

## Option 5: Firebase/Firestore

**Architecture:**
```
Client (React) <---> Firebase SDK <---> Firestore Database
                          |
                          v
                    Firebase Storage
```

**Setup:**
```bash
npm install firebase
```

**Implementation:**
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch projects
const querySnapshot = await getDocs(collection(db, "projects"));
const projects = querySnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

**Cost:**
- Free tier: 1 GB storage, 10 GB/month transfer
- Pay as you go: $0.18/GB storage

**Pros:**
- ✅ Real-time updates
- ✅ Generous free tier
- ✅ Easy authentication
- ✅ Built-in hosting
- ✅ Client SDK (no backend code)

**Cons:**
- ❌ Vendor lock-in
- ❌ NoSQL learning curve
- ❌ Less powerful queries than SQL

---

## Recommended Approach

### For Your Current Project: **GitHub API + Serverless Functions**

**Why:**
1. **Minimal Migration:** Keep current React app and Sveltia CMS
2. **No New Infrastructure:** Use Vercel functions (already on Vercel)
3. **Git-Based Workflow:** Keep version control benefits
4. **Incremental Adoption:** Can migrate route-by-route

**Implementation Plan:**

1. **Create Vercel API Route:**
```javascript
// api/projects/[slug].js
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export default async function handler(req, res) {
  const { slug } = req.query;

  try {
    const { data } = await octokit.repos.getContent({
      owner: 'oculairmedia',
      repo: 'reactfolionew',
      path: `src/content/projects/${slug}.json`,
    });

    const content = JSON.parse(
      Buffer.from(data.content, 'base64').toString('utf-8')
    );

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(content);
  } catch (error) {
    res.status(404).json({ error: 'Project not found' });
  }
}
```

2. **Update DynamicProjectPage Component:**
```javascript
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(res => res.json());

const DynamicProjectPage = () => {
  const { slug } = useParams();
  const { data: project, error } = useSWR(`/api/projects/${slug}`, fetcher);

  if (error) return <Navigate to="/portfolio" />;
  if (!project) return <Loading />;

  return <ProjectContent project={project} />;
};
```

3. **Add Webhook for Cache Invalidation:**
   - Configure GitHub webhook on push to master
   - Clear SWR cache on content updates

### For Future Scale: **Strapi or Sanity**

When you outgrow the static approach:
- **10,000+ monthly visitors** → Consider Sanity
- **Team collaboration needed** → Strapi or Sanity
- **Complex workflows** → Contentful

---

## Migration Checklist

- [ ] Install dependencies: `swr`, `@octokit/rest`
- [ ] Create Vercel API routes in `/api`
- [ ] Add GitHub token to Vercel environment variables
- [ ] Update components to use SWR hooks
- [ ] Test API endpoints locally
- [ ] Deploy to Vercel
- [ ] Configure webhook for cache invalidation
- [ ] Monitor API usage and performance

---

## Performance Comparison

| Approach | TTFB | Build Time | Real-time | Cost/Month |
|----------|------|------------|-----------|------------|
| Current (Static) | ~50ms | 2-3min | ❌ | $0 |
| GitHub API | ~200ms | None | ✅ | $0 |
| Strapi | ~100ms | None | ✅ | $9-12 |
| Sanity | ~80ms | None | ✅ | $0-99 |
| Next.js ISR | ~60ms | 2-3min | Partial | $0 |
| Firebase | ~150ms | None | ✅ | $0-5 |

---

## Conclusion

The enhanced Git-based approach (what we just built) is perfect for your current needs. It provides:
- ✅ **Automatic content loading** (no more manual imports)
- ✅ **CMS-driven project pages** (no more hard-coded components)
- ✅ **Zero infrastructure changes**
- ✅ **Fast builds and deploys**

When you need real-time API access, the **GitHub API + Serverless** approach offers the smoothest transition path without abandoning your current workflow.
