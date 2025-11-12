# Fix Merchant Ale House Broken Images

## The Problem
4 gallery images have broken URLs pointing to a non-existent `test 1` folder:
- `https://oculair.b-cdn.net/cache/images/projects/test 1/the-merchant-ale-house-1.jpg` (doesn't exist)
- `https://oculair.b-cdn.net/cache/images/projects/test 1/the-merchant-ale-house-12.jpg` (wrong folder)
- `https://oculair.b-cdn.net/cache/images/projects/test 1/the-merchant-ale-house-13.jpg` (wrong folder)
- `https://oculair.b-cdn.net/cache/images/projects/test 1/the-merchant-ale-house-15.jpg` (wrong folder)
- `https://oculair.b-cdn.net/cache/images/projects/test 1/the-merchant-ale-house-16.jpg` (wrong folder)

All these images exist in the correct folder: `work_merchant-ale-house`

## How to Fix

### Option 1: Run the Automated Script (Recommended)

```bash
cd /opt/stacks/implement-payload-cms-011CUxhkCJAiefDu2xtFQKcp
./fix-merchant-images.sh
```

The script will:
1. Ask for your CMS admin email and password
2. Log in to get an authentication token
3. Update the gallery with corrected image URLs
4. Remove the broken image #1 (doesn't exist)
5. Add 2 additional images (#7 and #14)

**Total: 9 working images (was 8, with 4 broken)**

### Option 2: Manual Fix via Admin UI

1. Go to: https://cms2.emmanuelu.com/admin
2. Navigate to: **Collections → Projects → The Merchant Ale House**
3. Scroll to the **Gallery** section
4. Replace URLs as follows:

**Remove:**
- Gallery item with URL ending in `test 1/the-merchant-ale-house-1.jpg`

**Update these 4 items:**
- `test 1/the-merchant-ale-house-12.jpg` → `work_merchant-ale-house/the-merchant-ale-house-12.jpg`
- `test 1/the-merchant-ale-house-13.jpg` → `work_merchant-ale-house/the-merchant-ale-house-13.jpg`
- `test 1/the-merchant-ale-house-15.jpg` → `work_merchant-ale-house/the-merchant-ale-house-15.jpg`
- `test 1/the-merchant-ale-house-16.jpg` → `work_merchant-ale-house/the-merchant-ale-house-16.jpg`

5. Click **Save**

## What Gets Fixed

### Before (8 images, 5 broken):
- ✅ the-merchant-ale-house-2.jpg
- ✅ the-merchant-ale-house-5.jpg
- ✅ the-merchant-ale-house-6.jpg
- ❌ the-merchant-ale-house-1.jpg (doesn't exist)
- ❌ the-merchant-ale-house-12.jpg (wrong folder)
- ❌ the-merchant-ale-house-13.jpg (wrong folder)
- ❌ the-merchant-ale-house-15.jpg (wrong folder)
- ❌ the-merchant-ale-house-16.jpg (wrong folder)

### After (9 images, all working):
- ✅ the-merchant-ale-house-2.jpg
- ✅ the-merchant-ale-house-5.jpg
- ✅ the-merchant-ale-house-6.jpg
- ✅ the-merchant-ale-house-7.jpg (added)
- ✅ the-merchant-ale-house-12.jpg (fixed)
- ✅ the-merchant-ale-house-13.jpg (fixed)
- ✅ the-merchant-ale-house-14.jpg (added)
- ✅ the-merchant-ale-house-15.jpg (fixed)
- ✅ the-merchant-ale-house-16.jpg (fixed)

## Verify

After running the script or manual update:
1. Visit: https://emmanuelu.com/projects/merchant-ale-house (or your frontend URL)
2. All gallery images should now load correctly
3. No broken image icons

