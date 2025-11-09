# CMS Usage Guide - Portfolio Management

This guide explains how to create and manage complete portfolio pages using the Sveltia CMS.

## Overview

Your portfolio website now has **fully CMS-driven project pages**. No more hard-coded React components or manual imports needed!

### What Changed?

**Before:**
- ❌ Each project required a custom React component
- ❌ Manual imports in `content_option.js`
- ❌ Manual route additions in `routes.js`
- ❌ Code changes required for new projects

**After:**
- ✅ Create full portfolio pages entirely through CMS
- ✅ Automatic content loading
- ✅ Dynamic routing
- ✅ No code changes needed

---

## Accessing the CMS

1. **Navigate to:** `https://emmulu.vercel.app/admin`
2. **Authenticate** with your GitHub account
3. **Start creating content!**

---

## Creating a Complete Portfolio Page

### Step 1: Create a Portfolio Item (Grid Card)

Portfolio items appear on the main portfolio page as grid cards.

1. Go to **Content** → **Portfolio Items**
2. Click **New Portfolio Item**
3. Fill in the fields:

| Field | Description | Example |
|-------|-------------|---------|
| **ID (URL slug)** | URL-friendly identifier | `my-awesome-project` |
| **Title** | Project name | "My Awesome Project" |
| **Short Description** | Brief description for grid | "A stunning web experience..." |
| **Thumbnail Image** | Image for portfolio grid | Upload or paste BunnyCDN URL |
| **Thumbnail Video URL** | Video for grid (optional) | `https://oculair.b-cdn.net/...` |
| **Use Video as Thumbnail?** | Toggle for video display | ☑️ if using video |
| **Project Detail Page** | Link to detail page | `/projects/my-awesome-project` |
| **Date** | Project date | "January 2024" |
| **Featured** | Show in featured section | ☑️ |
| **Order** | Display order (lower = first) | 1 |
| **Tags** | Categories/tags | ["web", "branding"] |

4. Click **Save**

**Important:** The `ID` field must match between Portfolio Item and Project Page!

---

### Step 2: Create a Project Detail Page

Project pages show the full case study with content, images, and videos.

1. Go to **Content** → **Project Pages**
2. Click **New Project Page**
3. Fill in the core fields:

#### Basic Information

| Field | Description |
|-------|-------------|
| **ID (URL slug)** | Must match Portfolio Item ID |
| **Title** | Full project title |
| **Subtitle** | Optional tagline |

#### Metadata (Collapsed Section)

| Field | Description |
|-------|-------------|
| **Client** | Client name |
| **Year** | Project year |
| **Date** | Display date |
| **Role** | Your role |
| **Exhibition** | Exhibition name (if applicable) |
| **Curators** | Curator names |
| **Collaborators** | Collaborator names |
| **Technologies** | Tech stack used |

#### Hero Media

Choose either image or video for the hero section:

| Field | Description |
|-------|-------------|
| **Type** | Select "image" or "video" |
| **Image URL** | Hero image (if type = image) |
| **Video URL** | Hero video (if type = video) |
| **Alt Text** | Accessibility text |

**Example:**
```
Type: video
Video URL: https://oculair.b-cdn.net/api/v1/videos/abc123/3rjei659/hevc
Alt Text: Project showcase video
```

#### Tags

Add searchable tags:
- AI Art
- Web Design
- Branding
- Video Production

#### Content Sections

This is where you write your case study! Add as many sections as needed.

**Section Fields:**
- **Section Title:** e.g., "Project Summary", "The Process", "The Outcome"
- **Section Content:** Write in **Markdown format** (supports bold, italic, links, lists)
- **Layout:** Choose "full-width" or "two-column"

**Example Section:**
```markdown
**Title:** Project Summary
**Content:**
This project combines *AI-generated imagery* with traditional animation techniques.

Key features:
- Real-time rendering
- Interactive elements
- Responsive design

[View the live site](https://example.com)

**Layout:** full-width
```

**Markdown Cheat Sheet:**
```markdown
**bold text**
*italic text*
[link text](https://url.com)
- Bullet point
1. Numbered list

# Heading 1
## Heading 2
### Heading 3
```

#### Media Gallery

Add images and videos to showcase your work.

**Gallery Item Fields:**
| Field | Description | Example |
|-------|-------------|---------|
| **Media Type** | "image" or "video" | image |
| **URL** | BunnyCDN URL or local path | `https://oculair.b-cdn.net/...` |
| **Alt Text/Caption** | Description | "Final product render" |
| **Width** | "half" or "full" | half |

**Layout Tips:**
- Use **"half"** width for side-by-side images
- Use **"full"** width for videos and feature images
- Half-width items automatically group in pairs

**Example Gallery:**
```
[Image 1] - half width
[Image 2] - half width
(These will appear side-by-side)

[Video 1] - full width
(This will span the full width)

[Image 3] - full width
[Image 4] - full width
```

4. Click **Save**

---

## Complete Example: Creating "Voices Unheard" Project

### Portfolio Item (`voices-unheard.json`)
```json
{
  "id": "voices-unheard",
  "title": "Voices Unheard: The Church and Marginalized Communities",
  "description": "A video collaboration using AI-generated imagery...",
  "video": "https://oculair.b-cdn.net/.../voices-poster.jpg",
  "isVideo": true,
  "link": "/projects/voices-unheard",
  "date": "November 2023",
  "featured": true,
  "order": 1,
  "tags": ["AI Art", "Video", "Social Commentary"]
}
```

### Project Page (`voices-unheard.json`)
```json
{
  "id": "voices-unheard",
  "title": "Voices Unheard: The Church and Marginalized Communities",
  "subtitle": "",
  "metadata": {
    "client": "Inter/Access",
    "date": "November 2023",
    "role": "AI Artist & Animator",
    "exhibition": "Inter/Access IA 360° Showcase",
    "collaborators": "Nyle Migiizi Johnston, Nigel Nolan, Emmanuel Umukoro",
    "technologies": "AI-generated imagery, Digital Animation"
  },
  "hero": {
    "type": "video",
    "video": "https://oculair.b-cdn.net/.../hevc",
    "alt": "Voices Unheard video installation"
  },
  "sections": [
    {
      "title": "Project Summary",
      "content": "*Voices Unheard* uses AI-generated imagery...",
      "layout": "full-width"
    },
    {
      "title": "The Process",
      "content": "This project was a collaborative effort...",
      "layout": "two-column"
    }
  ],
  "gallery": [
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/.../image1.jpg",
      "caption": "Generated Imagery",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/.../image2.jpg",
      "caption": "AI-Generated Church",
      "width": "half"
    }
  ]
}
```

---

## Workflow: Adding a New Project

### Quick Checklist

1. **Prepare Assets**
   - [ ] Upload images/videos to BunnyCDN
   - [ ] Get CDN URLs
   - [ ] Write project description

2. **Create Portfolio Item**
   - [ ] Choose unique ID (e.g., `new-project-2024`)
   - [ ] Add title and description
   - [ ] Upload/link thumbnail
   - [ ] Set link to `/projects/new-project-2024`
   - [ ] Add tags
   - [ ] Set order number

3. **Create Project Page**
   - [ ] Use **same ID** as portfolio item
   - [ ] Add title and subtitle
   - [ ] Fill metadata
   - [ ] Configure hero media
   - [ ] Write content sections (use Markdown)
   - [ ] Add gallery images/videos

4. **Publish**
   - [ ] Click **Save** in CMS
   - [ ] Wait for GitHub commit
   - [ ] Vercel auto-deploys (1-2 minutes)
   - [ ] Visit `yourdomain.com/projects/new-project-2024`

---

## Tips & Best Practices

### Content Writing

✅ **Do:**
- Write engaging, concise descriptions
- Use Markdown for formatting
- Break content into clear sections
- Include alt text for accessibility
- Use descriptive section titles

❌ **Don't:**
- Copy-paste unformatted text
- Create sections without titles
- Use raw HTML (use Markdown instead)
- Forget to save your work

### Media Management

✅ **Do:**
- Optimize images before uploading to BunnyCDN
- Use consistent naming conventions
- Set appropriate video formats (HEVC for compatibility)
- Add captions to all media
- Test videos on mobile devices

❌ **Don't:**
- Upload massive uncompressed files
- Use inconsistent image sizes
- Link to external (non-CDN) media
- Skip alt text

### Organization

✅ **Do:**
- Use meaningful IDs (`project-name`, not `proj1`)
- Set order numbers to control display sequence
- Tag projects consistently
- Keep featured projects under 6-8 items
- Review content before publishing

❌ **Don't:**
- Use spaces or special characters in IDs
- Change IDs after publishing (breaks links)
- Over-tag projects
- Leave metadata empty

---

## Portfolio Item Ordering

Control the display order on your portfolio page:

| Order Value | Effect |
|-------------|--------|
| 0-5 | Top featured projects |
| 6-15 | Recent work |
| 16+ | Archive/older work |

**Example:**
```
Order: 1 → "Voices Unheard" (shows first)
Order: 2 → "Couple-ish"
Order: 3 → "Binmetrics"
Order: 10 → "Older Project"
```

---

## Troubleshooting

### "Project not found" error

**Problem:** Visiting `/projects/my-project` shows "not found"

**Solutions:**
1. Verify the project JSON file exists in `/src/content/projects/`
2. Check that the filename matches the URL slug
3. Ensure the ID field matches the filename
4. Wait for Vercel deployment to complete
5. Clear browser cache

### Portfolio item not showing

**Problem:** Portfolio card doesn't appear on portfolio page

**Solutions:**
1. Check that the JSON file exists in `/src/content/portfolio/`
2. Verify the file has required fields (id, title, link)
3. Check for JSON syntax errors (use JSONLint.com)
4. Wait for deployment

### Images not loading

**Problem:** Images show broken/missing

**Solutions:**
1. Verify the BunnyCDN URL is correct and accessible
2. Check URL format (should start with `https://`)
3. Test URL in a browser first
4. Ensure image file exists on CDN
5. Check CORS settings on BunnyCDN

### Markdown not rendering

**Problem:** Markdown shows as plain text

**Solutions:**
1. Use the **Section Content** field (supports Markdown)
2. Don't use HTML tags (use Markdown instead)
3. Check Markdown syntax
4. Preview before publishing

---

## Advanced: Content Types

### Portfolio Item Structure
```typescript
{
  id: string;              // URL slug (required)
  title: string;           // Display title (required)
  description: string;     // Short description (required)
  img?: string;            // Thumbnail image URL
  video?: string;          // Thumbnail video URL
  isVideo?: boolean;       // Use video as thumbnail
  link: string;            // Path to detail page (required)
  date?: string;           // Display date
  featured?: boolean;      // Show in featured section
  order?: number;          // Display order (default: 0)
  tags?: string[];         // Category tags
}
```

### Project Page Structure
```typescript
{
  id: string;              // URL slug (must match portfolio item)
  title: string;           // Full title
  subtitle?: string;       // Tagline
  metadata?: {             // Project metadata
    client?: string;
    year?: string;
    date?: string;
    role?: string;
    exhibition?: string;
    curators?: string;
    collaborators?: string;
    technologies?: string;
  };
  hero?: {                 // Hero media section
    type: 'image' | 'video';
    image?: string;
    video?: string;
    alt?: string;
  };
  tags?: string[];         // Category tags
  sections?: Array<{       // Content sections
    title: string;
    content: string;       // Markdown content
    layout?: 'full-width' | 'two-column';
  }>;
  gallery?: Array<{        // Media gallery
    type: 'image' | 'video';
    url: string;
    caption?: string;
    width?: 'half' | 'full';
  }>;
}
```

---

## Next Steps

Now that you understand how to use the CMS:

1. **Create your first project** using this guide
2. **Test the workflow** end-to-end
3. **Migrate existing projects** from hard-coded pages to CMS
4. **Experiment with layouts** and content sections
5. **Explore API integration** (see `API_INTEGRATION_OPTIONS.md`)

---

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the example project (Voices Unheard)
- Inspect the JSON files in `/src/content/`
- Refer to the Sveltia CMS docs: https://sveltia.com

Happy content creating! 🎨
