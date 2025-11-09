# Content Management System (CMS) Guide

This guide explains how to use the Sveltia CMS to manage all content on your portfolio website.

## Accessing the CMS

1. Navigate to `https://yourdomain.com/admin/` in your browser
2. Authenticate using GitHub OAuth
3. You'll see the CMS dashboard with all available collections

## Available Content Collections

### 1. Site Settings

**Path:** Settings → Site Configuration

Manage core site settings:
- **Logo Text:** The text displayed in the navigation bar
- **Meta Information:** Site title and description for SEO
- **Contact Configuration:** Email settings and EmailJS credentials
- **Social Profiles:** Links to your social media profiles (GitHub, Facebook, LinkedIn, Twitter)

### 2. Navigation & Footer

**Path:** Navigation & Footer

#### Navigation Menu
Manage the main navigation menu items:
- **Label:** Display text for the menu item
- **Path:** URL or route path
- **External Link:** Toggle if the link is external
- **Order:** Numeric order for menu positioning

#### Footer
Customize footer content:
- **Copyright Text:** Copyright notice
- **Footer Note:** Additional footer text
- **Footer Links:** List of footer links with labels and URLs

### 3. Home Page

**Path:** Home Page → Introduction

Control the hero section content:
- **Title:** Main heading (e.g., "I'm Emmanuel Umukoro")
- **Description:** Subtitle text
- **Profile Image URL:** Hero image
- **Animated Text Phrases:** List of typewriter animation phrases

### 4. About Page

**Path:** About Page → About Content

Manage your about section:
- **Title:** Page heading
- **About Me Text:** Your bio/description
- **Work Timeline:** List of job positions with title, company, and dates
- **Skills:** Skills list with proficiency levels (0-100)
- **Services Offered:** List of services with titles and descriptions

### 5. Portfolio Items

**Path:** Portfolio Items

Manage portfolio grid items:
- **ID:** Unique identifier (used for URL)
- **Title:** Project name
- **Description:** Brief project description
- **Image:** Project thumbnail
- **Video URL:** Optional video instead of image
- **Is Video:** Toggle for video display
- **Project Link:** Link to project detail page
- **Date:** Project date
- **Tags:** List of project tags/categories

### 6. Project Pages

**Path:** Project Pages

Create detailed project case studies with a flexible structure:

#### Basic Information
- **ID:** Unique identifier matching portfolio item
- **Title:** Project name
- **Subtitle:** Optional subtitle
- **Client:** Client name
- **Year/Date:** Project timeframe
- **Role:** Your role in the project
- **Exhibition:** Exhibition name (if applicable)
- **Curators:** Curator names (if applicable)
- **Collaborators:** Team members
- **Technologies:** Tech stack used

#### Featured Media
- **Featured Image:** Main project image
- **Featured Video URL:** Main project video
- **Tags:** Project categories

#### Content Sections
Add multiple content sections with:
- **Section Title:** Heading for the section
- **Section Content:** Markdown-formatted content
- **Layout:** Choose between "full-width" or "two-column"

#### Media Gallery
Add images and videos to showcase the project:
- **Media Type:** Image or Video
- **URL:** Media file URL
- **Caption:** Alt text or description
- **Width:** Half or full width display

### 7. Page Content

**Path:** Page Content

Customize page-specific content:

#### Portfolio Page
- **Page Title:** Main heading (default: "Portfolio")
- **Page Description:** Optional description

#### Contact Page
- **Page Title:** Main heading (default: "Contact Me")
- **Section Title:** Get in touch section heading
- **Form Submit Button:** Button text (default: "Send")
- **Sending Text:** Loading state text (default: "Sending...")
- **Success Message:** Success notification text
- **Error Message:** Error notification text

#### UI Text
Global UI element labels:
- **View All Projects Button**
- **Return to Portfolio Button**
- **Featured Projects Title**
- **My Portfolio Button**
- **Contact Me Button**

## Content Workflow

### Editorial Workflow (Optional)

The CMS is currently in "simple" mode, meaning changes publish immediately. You can enable an editorial workflow by changing `publish_mode` in `/public/admin/config.yml`:

```yaml
publish_mode: editorial_workflow
```

This enables:
- **Draft:** Save work without publishing
- **In Review:** Submit for review
- **Ready:** Approve and publish

### Media Management

Upload images and videos through the CMS:
1. Click on any image field
2. Choose "Upload" to add new media
3. Media is stored in `/public/images/`
4. The CMS automatically handles paths

## Best Practices

### Images
- Use descriptive filenames
- Optimize images before uploading (recommended: max 2000px width)
- Use WebP or JPEG format for best performance
- CDN URLs (oculair.b-cdn.net) are automatically optimized

### Content Writing
- Use Markdown for rich text formatting
- Keep descriptions concise and engaging
- Use proper heading hierarchy (H1 → H2 → H3)
- Include alt text for all images

### Navigation
- Keep menu items to 5-7 for best UX
- Use clear, descriptive labels
- Set proper order values (multiples of 10 recommended for easy reordering)

### Project Pages
- Tell a story: Summary → Process → Outcome
- Use high-quality images
- Break content into scannable sections
- Include client/project details

## Troubleshooting

### Changes Not Appearing
1. Check that the file was saved in the CMS
2. Verify the JSON syntax is valid
3. Clear your browser cache
4. Rebuild the site if using static generation

### Authentication Issues
- Ensure you have access to the GitHub repository
- Check that OAuth is properly configured
- Verify the base_url matches your deployment URL

### Media Upload Fails
- Check file size (keep under 10MB)
- Ensure proper permissions on `/public/images/` directory
- Verify media_folder path in config.yml

## Advanced Customization

### Adding New Collections

To add new content types, edit `/public/admin/config.yml`:

```yaml
collections:
  - name: "new-collection"
    label: "New Collection"
    folder: "src/content/new-collection"
    create: true
    fields:
      - { label: "Title", name: "title", widget: "string" }
      # Add more fields...
```

### Custom Widgets

Sveltia CMS supports various field widgets:
- `string`: Single line text
- `text`: Multi-line text
- `markdown`: Rich text editor
- `boolean`: Toggle switch
- `number`: Numeric input
- `date`: Date picker
- `image`: Image upload
- `list`: Repeatable items
- `object`: Grouped fields
- `select`: Dropdown menu

## Support

For CMS-specific issues, consult:
- [Sveltia CMS Documentation](https://github.com/sveltia/sveltia-cms)
- [NetlifyCMS Widget Reference](https://www.netlifycms.org/docs/widgets/)

For site-specific questions, check the project README or contact the development team.
