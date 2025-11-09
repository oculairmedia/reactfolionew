# CMS Migration Guide

## Overview
This document describes the migration process for importing static JSON content into the Payload CMS.

## Migration Script
The `migrate-to-cms.js` script imports all project and portfolio data from the static JSON files into Payload CMS.

### Usage
```bash
ADMIN_PASSWORD='your_password' node migrate-to-cms.js
```

### What it does:
1. Logs into the CMS using admin credentials
2. Reads all JSON files from `src/content/projects/` and `src/content/portfolio/`
3. Transforms the data to match Payload CMS schema
4. Creates entries in the `projects` and `portfolio` collections

### Schema Mapping

#### Projects Collection
- **id**: Unique identifier (URL slug)
- **title**: Project title
- **subtitle**: Project subtitle (optional)
- **metadata**: Group containing client, date, role, technologies
- **hero**: Group containing type (image/video), url, and alt text
- **tags**: Array of tag objects
- **sections**: Array of content sections with title, content, and layout
- **gallery**: Array of media items with type, url, caption, and width

#### Portfolio Collection
- **id**: Unique identifier (matches project ID)
- **title**: Portfolio item title
- **description**: Short description
- **isVideo**: Boolean flag for video items
- **video**: Video URL (if isVideo is true)
- **img**: Image URL or video poster
- **link**: Link to full project page
- **date**: Display date
- **tags**: Array of tag objects

## CMS Details
- **URL**: https://cms2.emmanuelu.com
- **Admin Panel**: https://cms2.emmanuelu.com/admin
- **API Base**: https://cms2.emmanuelu.com/api
- **Admin Email**: emanuvaderland@gmail.com

## Vercel Environment Variables
The frontend requires the following environment variable to be set in Vercel:

```
REACT_APP_API_URL=https://cms2.emmanuelu.com/api
```

This tells the React app where to fetch CMS data from.

## Verification
After migration, verify the data:

```bash
# Count projects
curl https://cms2.emmanuelu.com/api/projects | jq '.docs | length'

# Count portfolio items
curl https://cms2.emmanuelu.com/api/portfolio | jq '.docs | length'

# View a specific project
curl 'https://cms2.emmanuelu.com/api/projects?where[id][equals]=binmetrics' | jq '.docs[0]'
```

## Re-running Migration
If you need to re-run the migration:
1. Delete all existing entries via the admin panel or API
2. Run the migration script again

Note: The script will fail if entries with the same ID already exist.
