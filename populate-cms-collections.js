#!/usr/bin/env node

/**
 * Populate Payload CMS Collections
 * 
 * Uploads portfolio and project data from JSON files to Payload CMS,
 * linking to the imported media files.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const CMS_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://cms2.emmanuelu.com';
const PAYLOAD_EMAIL = process.env.PAYLOAD_EMAIL || 'emanuvaderland@gmail.com';
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD;

let authToken = null;

// Authenticate
async function authenticate() {
  try {
    const response = await axios.post(`${CMS_URL}/api/users/login`, {
      email: PAYLOAD_EMAIL,
      password: PAYLOAD_PASSWORD,
    });

    authToken = response.data.token;
    console.log('✅ Authenticated successfully');
    return authToken;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    process.exit(1);
  }
}

// Find media by filename pattern
async function findMedia(filenamePattern) {
  try {
    const response = await axios.get(
      `${CMS_URL}/api/media?where[filename][contains]=${encodeURIComponent(filenamePattern)}&limit=1`,
      {
        headers: { 'Authorization': `JWT ${authToken}` },
      }
    );

    return response.data.docs?.[0] || null;
  } catch (error) {
    console.error(`Failed to find media: ${filenamePattern}`, error.message);
    return null;
  }
}

// Extract filename from CDN URL
function extractFilename(url) {
  if (!url) return null;
  const match = url.match(/([^\/]+)\.(jpg|jpeg|png|gif|webp|mp4)(\?|$)/i);
  return match ? match[1] : null;
}

// Create portfolio item
async function createPortfolioItem(item, media) {
  try {
    // Transform tags if they're strings
    const tags = Array.isArray(item.tags) 
      ? item.tags.map(t => typeof t === 'string' ? { tag: t } : t)
      : [];

    const payload = {
      id: item.id,
      title: item.title,
      description: item.description || '',
      isVideo: item.isVideo || false,
      link: item.link || `/portfolio/${item.id}`,
      date: item.date || new Date().toISOString().split('T')[0],
      tags: tags,
    };

    // Link media
    if (media) {
      payload.featuredImage = media.id;
      if (item.isVideo && item.video) {
        // Try to find video media
        const videoFilename = extractFilename(item.video);
        if (videoFilename) {
          const videoMedia = await findMedia(videoFilename);
          if (videoMedia) {
            payload.featuredVideo = videoMedia.id;
          }
        }
      }
    }

    // Legacy fields for backward compatibility
    if (item.img) payload.img = item.img;
    if (item.video) payload.video = item.video;

    const response = await axios.post(
      `${CMS_URL}/api/portfolio`,
      payload,
      {
        headers: {
          'Authorization': `JWT ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Created portfolio item: ${item.title}`);
    return response.data.doc;
  } catch (error) {
    console.error(`❌ Failed to create portfolio item: ${item.title}`);
    console.error(error.response?.data || error.message);
    return null;
  }
}

// Load all portfolio JSON files
function loadPortfolioItems() {
  const portfolioDir = path.join(__dirname, 'src/content/portfolio');
  const files = fs.readdirSync(portfolioDir).filter(f => f.endsWith('.json'));
  
  return files.map(file => {
    const content = fs.readFileSync(path.join(portfolioDir, file), 'utf-8');
    return JSON.parse(content);
  });
}

// Main execution
async function main() {
  console.log('🔍 Starting CMS Collection Population...\n');
  
  // Check for required environment variables
  if (!PAYLOAD_PASSWORD) {
    console.error('❌ Error: PAYLOAD_PASSWORD environment variable is required');
    console.error('Usage: PAYLOAD_PASSWORD=your_password node populate-cms-collections.js');
    process.exit(1);
  }

  // Authenticate
  await authenticate();
  
  // Load portfolio items
  console.log('\n📥 Loading portfolio items from JSON files...');
  const portfolioItems = loadPortfolioItems();
  console.log(`Found ${portfolioItems.length} portfolio items\n`);

  // Process each portfolio item
  const stats = {
    total: portfolioItems.length,
    created: 0,
    failed: 0,
    errors: [],
  };

  console.log('📤 Creating portfolio items in CMS...\n');

  for (const item of portfolioItems) {
    // Find matching media
    let media = null;
    if (item.img) {
      const filename = extractFilename(item.img);
      if (filename) {
        console.log(`   🔍 Looking for media: ${filename}...`);
        media = await findMedia(filename);
        if (media) {
          console.log(`   ✓ Found media: ${media.filename}`);
        } else {
          console.log(`   ⚠️  No media found for ${filename}`);
        }
      }
    }

    // Create portfolio item
    const result = await createPortfolioItem(item, media);
    
    if (result) {
      stats.created++;
    } else {
      stats.failed++;
      stats.errors.push(`${item.title}: Failed to create`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Population Summary:');
  console.log('='.repeat(70));
  console.log(`✅ Created: ${stats.created}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`📦 Total processed: ${stats.total}`);
  
  if (stats.errors.length > 0) {
    console.log('\n❌ Errors:');
    stats.errors.forEach(err => console.log(`   ${err}`));
  }
  
  console.log('='.repeat(70));
  console.log('\n✅ Population complete!');
  console.log(`\nView portfolio at: ${CMS_URL}/admin/collections/portfolio`);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
