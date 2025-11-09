# CMS Integration Verification Checklist

## ✅ Backend Verification

### CMS API Health
- [x] CMS accessible at https://cms2.emmanuelu.com
- [x] Admin panel accessible at https://cms2.emmanuelu.com/admin
- [x] API endpoint responds: https://cms2.emmanuelu.com/api/projects
- [x] API endpoint responds: https://cms2.emmanuelu.com/api/portfolio
- [x] CORS configured for https://www.emmanuelu.com

### Data Verification
- [x] 11 projects migrated successfully
- [x] 11 portfolio items migrated successfully
- [x] Sample project has complete data (metadata, hero, sections, gallery)
- [x] Tags properly formatted as array of objects

```bash
# Verify projects count
curl -s https://cms2.emmanuelu.com/api/projects | jq '.totalDocs'
# Expected: 11

# Verify portfolio count
curl -s https://cms2.emmanuelu.com/api/portfolio | jq '.totalDocs'
# Expected: 11

# Verify project structure
curl -s 'https://cms2.emmanuelu.com/api/projects?where[id][equals]=binmetrics' | jq '.docs[0] | keys'
# Expected: ["id", "title", "subtitle", "metadata", "hero", "tags", "sections", "gallery", ...]
```

## ✅ Frontend Verification

### Deployment Status
- [x] New build deployed to Vercel
- [x] Build hash changed: `main.35b1a4ea.js`
- [x] Environment variable set: `REACT_APP_API_URL=https://cms2.emmanuelu.com/api`

### Browser Testing Checklist

#### 1. Portfolio Page
Visit: https://www.emmanuelu.com/portfolio

**Expected Behavior:**
- [ ] Portfolio grid displays 11 items
- [ ] Video items show video preview (if isVideo: true)
- [ ] Image items show static image
- [ ] Clicking an item navigates to project detail page
- [ ] All images/videos load properly

**To Verify CMS Data is Being Used:**
- Open browser DevTools → Network tab
- Look for request to `https://cms2.emmanuelu.com/api/portfolio`
- Should see 200 response with JSON data

#### 2. Project Detail Pages
Visit any project, e.g.: https://www.emmanuelu.com/projects/binmetrics

**Expected Behavior:**
- [ ] Project title displays correctly
- [ ] Subtitle displays (if present)
- [ ] Metadata shows (client, date, role, technologies)
- [ ] Hero image or video displays
- [ ] Content sections render properly
- [ ] Gallery images display
- [ ] Tags display

**To Verify CMS Data:**
- Check Network tab for request to `https://cms2.emmanuelu.com/api/projects?where[id][equals]=binmetrics`
- Should see 200 response with full project data

#### 3. Home Page
Visit: https://www.emmanuelu.com/

**Expected Behavior:**
- [ ] Featured projects display (if implemented)
- [ ] Portfolio preview displays
- [ ] Links to projects work

#### 4. About Page
Visit: https://www.emmanuelu.com/about

**Expected Behavior:**
- [ ] Page loads correctly
- [ ] If global CMS data configured, it should display

## 🔧 Troubleshooting

### If Portfolio Shows No Items
1. Check browser console for errors
2. Verify `REACT_APP_API_URL` is set in Vercel environment variables
3. Check if CMS API is accessible from browser
4. Verify CORS headers are correct

### If Portfolio Shows Static Data Instead of CMS
1. Check Network tab - is there a request to CMS API?
2. If no request: Environment variable may not be set
3. If request fails: Check CORS or API availability
4. If request succeeds but shows old data: Clear browser cache

### Verify Environment Variable
The frontend should be making requests to:
```
https://cms2.emmanuelu.com/api/portfolio
https://cms2.emmanuelu.com/api/projects
```

If it's making requests to `localhost:3001`, the environment variable isn't set correctly.

## 📝 CMS Admin Testing

### Login to Admin Panel
1. Visit https://cms2.emmanuelu.com/admin
2. Login with:
   - Email: emanuvaderland@gmail.com
   - Password: 7beEXKPk93xSD6m

### Test Content Editing
1. Navigate to Projects collection
2. Click on any project (e.g., "Binmetrics")
3. Edit the title or description
4. Save changes
5. Visit the project page on frontend
6. Verify changes appear (may need to refresh)

### Test Creating New Project
1. Click "Create New" in Projects collection
2. Fill in required fields:
   - ID: test-project
   - Title: Test Project
   - Metadata, Hero, etc.
3. Save
4. Check if it appears in `/api/projects`
5. Check if it shows on portfolio page

## 🎯 Success Criteria

All of these should be true:
- [x] CMS backend running and accessible
- [x] Data successfully migrated (11 projects + 11 portfolio items)
- [x] Frontend deployed with latest code
- [ ] Portfolio page displays CMS data (verify in browser)
- [ ] Project detail pages display CMS data (verify in browser)
- [ ] Network requests show CMS API calls
- [ ] Admin panel allows editing content
- [ ] Edited content appears on frontend

## 📊 Quick Status Check

Run this command to verify everything:

```bash
echo "=== CMS Health Check ==="
curl -s https://cms2.emmanuelu.com/api/projects | jq '{projects: .totalDocs}'
curl -s https://cms2.emmanuelu.com/api/portfolio | jq '{portfolio: .totalDocs}'
echo ""
echo "=== Frontend Check ==="
curl -s https://www.emmanuelu.com | grep -o "main\.[a-f0-9]*\.js"
echo ""
echo "If you see numbers above and a JS file, everything is deployed!"
```

Expected output:
```
=== CMS Health Check ===
{
  "projects": 11
}
{
  "portfolio": 11
}

=== Frontend Check ===
main.35b1a4ea.js

If you see numbers above and a JS file, everything is deployed!
```
