# Cloudflare Cache Configuration for Payload CMS API

## Current Status
- **Domain**: cms2.emmanuelu.com
- **Current Cache Status**: DYNAMIC (not caching - GOOD ✅)
- **Issue**: Need to ensure API responses remain uncached or cache-busted to prevent stale data

## Problem Statement
The Payload CMS API serves dynamic content that changes frequently when content editors make updates. If Cloudflare caches these API responses, users will see stale data until the cache expires, even though:
1. The frontend has cache-busting implemented (`?_t=timestamp` parameter)
2. The CMS has fresh data

## Required Cloudflare Configuration

### Option 1: Bypass Cache for API Endpoints (RECOMMENDED)
Create a Cache Rule to bypass caching entirely for CMS API endpoints.

**Rule Configuration:**
- **Rule Name**: "Bypass Cache for CMS API"
- **When incoming requests match**: 
  - Hostname equals `cms2.emmanuelu.com`
  - AND URI Path starts with `/api/`
- **Then**:
  - Cache eligibility: Bypass cache
  - Origin Cache Control: Enabled (respect origin headers)

**Why This Works:**
- API responses are dynamic and personalized
- Content changes frequently (whenever editors update CMS)
- Bypassing cache ensures users always get fresh data
- No risk of serving stale content
- Frontend cache-busting parameters will work correctly

### Option 2: Respect Cache-Control Headers (ALTERNATIVE)
If you want Cloudflare to respect what the origin server says:

**Rule Configuration:**
- **Rule Name**: "Respect CMS Cache Headers"
- **When incoming requests match**:
  - Hostname equals `cms2.emmanuelu.com`
  - AND URI Path starts with `/api/`
- **Then**:
  - Cache eligibility: Eligible
  - Edge TTL: Respect origin cache control headers
  - Browser TTL: Respect origin cache control headers

**Backend Changes Required:**
The Payload CMS backend would need to send these headers:
```
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

### Option 3: Short TTL with Cache-Busting (HYBRID)
Allow minimal caching with the frontend's cache-busting parameter:

**Rule Configuration:**
- **Rule Name**: "Short Cache for CMS API"
- **When incoming requests match**:
  - Hostname equals `cms2.emmanuelu.com`
  - AND URI Path starts with `/api/`
- **Then**:
  - Cache eligibility: Eligible
  - Edge TTL: 60 seconds
  - Browser TTL: 0 seconds (no browser caching)
  - Cache Key: Custom
    - Query string: Include all query strings (ensures `?_t=timestamp` creates unique cache entries)

**Why This Works:**
- Each unique `_t` parameter creates a new cache entry
- Very short TTL (60 seconds) means minimal stale data risk
- Reduces backend load slightly while maintaining freshness
- Frontend cache-busting ensures users get fresh data

## Page Rules (Legacy Alternative)
If you're using Page Rules instead of the newer Cache Rules:

**Page Rule:**
- **URL Pattern**: `cms2.emmanuelu.com/api/*`
- **Settings**:
  - Cache Level: Bypass
  - Origin Cache Control: On

## Additional Recommendations

### 1. Purge Cache on Content Updates
Implement a webhook in Payload CMS that purges Cloudflare cache when content changes:

**Payload CMS Hook** (payload/hooks/purgeCloudflareCache.js):
```javascript
const purgeCloudflareCacheAfterChange = async ({ doc, req, operation }) => {
  if (operation === 'update' || operation === 'create') {
    const zone = process.env.CLOUDFLARE_ZONE_ID;
    const token = process.env.CLOUDFLARE_API_TOKEN;
    
    await fetch(`https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: [
          `https://cms2.emmanuelu.com/api/globals/site-settings`,
          `https://cms2.emmanuelu.com/api/globals/home-intro`,
          `https://cms2.emmanuelu.com/api/globals/about-page`,
          // Add other endpoints as needed
        ]
      })
    });
  }
};

export default purgeCloudflareCacheAfterChange;
```

### 2. Development Mode
When making frequent CMS changes, enable Cloudflare Development Mode:
- Dashboard → Caching → Configuration → Development Mode (ON)
- This temporarily bypasses cache for 3 hours
- Useful during content migration or bulk updates

### 3. Cache Everything with Purge API
For high-traffic sites that need caching but also need instant updates:

**Cache Rule:**
- Cache everything for `/api/*`
- Set Edge TTL: 1 hour
- Implement purge webhook (as shown above)
- Purge specific URLs when content changes

## Testing the Configuration

### 1. Check Cache Status
```bash
# Should show "cf-cache-status: DYNAMIC" or "BYPASS"
curl -I https://cms2.emmanuelu.com/api/globals/about-page | grep cf-cache-status
```

### 2. Update Content in CMS
1. Log into CMS: https://cms2.emmanuelu.com/admin
2. Update a global (e.g., About Page title)
3. Save changes
4. Immediately check frontend: https://emmanuelu.com/about
5. Should see changes within 1-2 seconds (Vercel build time)

### 3. Verify Cache-Busting
```bash
# These should return the same current data (no caching)
curl -s https://cms2.emmanuelu.com/api/globals/about-page?_t=1 | jq .title
curl -s https://cms2.emmanuelu.com/api/globals/about-page?_t=2 | jq .title
```

## Current Implementation Status

✅ **Frontend**: Cache-busting implemented in `src/utils/payloadApi.js`
- All API requests include `?_t=${Date.now()}` timestamp parameter
- Prevents service worker from serving stale data
- Ensures unique requests bypass any query-string-sensitive caches

✅ **Cloudflare**: Currently showing `DYNAMIC` status (not caching)
- No configuration changes needed urgently
- Recommended to add explicit bypass rule for safety

❌ **Backend**: No Cache-Control headers set
- Payload CMS not sending explicit cache directives
- Relying on Cloudflare's default behavior (currently working)
- Recommended to add explicit headers for defense-in-depth

## Recommended Action Plan

### Immediate (Do Now)
1. **Add Cloudflare Cache Rule**: Bypass cache for `cms2.emmanuelu.com/api/*`
   - Navigate to: Cloudflare Dashboard → Caching → Cache Rules
   - Create new rule with settings from Option 1 above
   - This ensures behavior won't change if Cloudflare updates defaults

### Short-term (This Week)
2. **Add Cache-Control Headers in Payload**
   - Modify Payload CMS to send `Cache-Control: no-cache` for API responses
   - Provides defense-in-depth (works even if Cloudflare rules change)

### Long-term (Optional Enhancement)
3. **Implement Smart Caching with Purge Webhook**
   - Allow Cloudflare to cache with short TTL (5-10 minutes)
   - Add webhook to purge cache on content updates
   - Reduces backend load while maintaining freshness
   - Best of both worlds for high-traffic sites

## Cloudflare Dashboard Access

To configure these rules:
1. Log into Cloudflare Dashboard
2. Select the domain: `emmanuelu.com` (or parent domain for cms2 subdomain)
3. Navigate to: **Caching** → **Cache Rules** (or **Page Rules** for legacy)
4. Click "**Create Rule**"
5. Apply settings from **Option 1** above

## Summary for Cloudflare Agent

**TL;DR**: Create a Cloudflare Cache Rule that bypasses caching for all requests to `cms2.emmanuelu.com/api/*`. This ensures the CMS API always returns fresh data to the frontend, preventing stale content issues. The frontend already has cache-busting implemented, so this Cloudflare rule provides an additional layer of protection.

Current status is good (`cf-cache-status: DYNAMIC`), but an explicit rule makes the configuration resilient to future changes or default behavior updates.
