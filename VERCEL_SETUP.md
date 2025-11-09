# Vercel Environment Setup

## Required Environment Variable

To connect your frontend to the Payload CMS API, you need to set the following environment variable in Vercel:

### Steps:

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (www.emmanuelu.com)
3. Go to **Settings** → **Environment Variables**
4. Add the following variable:

```
Name: REACT_APP_API_URL
Value: https://cms2.emmanuelu.com/api
```

5. Select which environments to apply it to:
   - ✅ Production
   - ✅ Preview
   - ✅ Development (optional)

6. Click **Save**
7. Redeploy your application for the changes to take effect

### Verification

After setting the environment variable and redeploying:

1. Visit your site: https://www.emmanuelu.com
2. Open browser console (F12)
3. Check for any API calls to `https://cms2.emmanuelu.com/api`
4. Verify that portfolio items, home content, and about page load from CMS

### Fallback Behavior

The application is designed with fallback support:
- If the CMS API is unreachable, it will automatically fall back to static JSON files
- This ensures the site remains functional even if the CMS is temporarily down
- Check browser console for any error messages if fallback is triggered

### Local Development

For local development, create a `.env` file in the project root:

```env
REACT_APP_API_URL=https://cms2.emmanuelu.com/api
```

Or for local CMS testing:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

## Updated Components

The following components now fetch from the CMS API:

- ✅ **Home page** (`src/pages/home/index.js`) - Home intro and featured portfolio items
- ✅ **Portfolio page** (`src/pages/portfolio/index.js`) - All portfolio items
- ✅ **About page** (`src/pages/about/index.js`) - About content, timeline, skills, services
- ✅ **DynamicProjectPage** (`src/components/DynamicProjectPage.js`) - Individual project details

## Testing

After deployment, test these pages:
- Home: https://www.emmanuelu.com
- Portfolio: https://www.emmanuelu.com/portfolio
- About: https://www.emmanuelu.com/about
- Project pages: https://www.emmanuelu.com/portfolio/{project-slug}

All content should now be dynamically loaded from the CMS!
