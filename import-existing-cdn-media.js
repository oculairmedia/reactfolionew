#!/usr/bin/env node

/**
 * Import Existing CDN Media to Payload CMS
 * 
 * Scans cdn-images-found.txt and creates Media entries for each URL
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CMS_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://cms2.emmanuelu.com';
const PAYLOAD_EMAIL = process.env.PAYLOAD_EMAIL || 'admin@emmanuelu.com';
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD;

let authToken = null;

// Authenticate with Payload CMS
async function authenticate() {
  try {
    const response = await fetch(`${CMS_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: PAYLOAD_EMAIL,
        password: PAYLOAD_PASSWORD,
      }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }

    const data = await response.json();
    authToken = data.token;
    console.log('✅ Authenticated successfully');
    return authToken;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    process.exit(1);
  }
}

// Check if media already exists
async function mediaExists(cdnUrl) {
  try {
    const response = await fetch(
      `${CMS_URL}/api/media?where[cdn_url][equals]=${encodeURIComponent(cdnUrl)}&limit=1`,
      {
        headers: { 'Authorization': `JWT ${authToken}` },
      }
    );

    const data = await response.json();
    return data.docs && data.docs.length > 0;
  } catch (error) {
    console.error(`Error checking media existence: ${error.message}`);
    return false;
  }
}

// Generate alt text from URL
function generateAltText(url) {
  const filename = url.split('/').pop().split('?')[0];
  
  // Remove hash if present (40-char hex)
  const nameWithoutHash = filename.replace(/^[a-f0-9]{40}\./, '');
  
  // Remove extension
  const nameWithoutExt = nameWithoutHash.replace(/\.[^.]+$/, '');
  
  // Replace hyphens/underscores with spaces and title case
  if (nameWithoutExt) {
    return nameWithoutExt
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
  
  return filename;
}

// Determine media type from URL
function getMediaType(url) {
  if (url.includes('/videos/') || url.endsWith('.avc') || url.endsWith('.hevc')) {
    return 'video';
  }
  return 'image';
}

// Get source context from URL
function getSourceContext(url) {
  const urlPath = url.replace('https://oculair.b-cdn.net/', '');
  
  if (urlPath.includes('projects/work_')) {
    const match = urlPath.match(/projects\/work_([^/]+)/);
    return match ? `Project: ${match[1].replace(/-/g, ' ')}` : 'Project image';
  }
  
  if (urlPath.includes('projects/test')) {
    const match = urlPath.match(/projects\/test \d+\/([^/]+)/);
    return match ? `Test: ${match[1].replace(/-/g, ' ')}` : 'Test image';
  }
  
  if (urlPath.includes('-poster')) {
    return 'Portfolio poster image';
  }
  
  return 'CDN media';
}

// Create media entry
async function createMediaEntry(cdnUrl) {
  try {
    const exists = await mediaExists(cdnUrl);
    
    if (exists) {
      console.log(`⏭️  Skipping (already exists): ${cdnUrl.substring(0, 60)}...`);
      return { skipped: true };
    }

    const mediaType = getMediaType(cdnUrl);
    const altText = generateAltText(cdnUrl);
    const caption = getSourceContext(cdnUrl);

    const mediaData = {
      cdn_url: cdnUrl,
      source: 'cdn',
      media_type: mediaType,
      alt: altText,
      caption: caption,
      cdn_synced: true,
      cdn_uploaded_at: new Date().toISOString(),
    };

    const response = await fetch(`${CMS_URL}/api/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${authToken}`,
      },
      body: JSON.stringify(mediaData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Created: ${altText} (${mediaType})`);
    return { created: true, data };
  } catch (error) {
    console.error(`❌ Failed to create: ${error.message}`);
    return { failed: true, error: error.message };
  }
}

// Main execution
async function main() {
  console.log('🔍 Starting CDN Media Import...\n');
  
  // Read CDN URLs from file
  const cdnUrlsFile = path.join(__dirname, 'cdn-images-found.txt');
  
  if (!fs.existsSync(cdnUrlsFile)) {
    console.error('❌ cdn-images-found.txt not found!');
    console.error('Run: grep -r "oculair.b-cdn.net" src/content/ -h | grep -o "https://oculair\\.b-cdn\\.net/[^\"]*" | sort -u > cdn-images-found.txt');
    process.exit(1);
  }

  const cdnUrls = fs.readFileSync(cdnUrlsFile, 'utf-8')
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.trim());

  console.log(`📊 Found ${cdnUrls.length} CDN URLs to import\n`);
  
  if (cdnUrls.length === 0) {
    console.log('No CDN URLs found. Exiting.');
    return;
  }
  
  // Authenticate
  await authenticate();
  
  console.log('\n📤 Importing media to Payload CMS...\n');
  
  let stats = {
    total: cdnUrls.length,
    created: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };
  
  for (const cdnUrl of cdnUrls) {
    const result = await createMediaEntry(cdnUrl);
    
    if (result.created) {
      stats.created++;
    } else if (result.skipped) {
      stats.skipped++;
    } else if (result.failed) {
      stats.failed++;
      stats.errors.push(`${cdnUrl}: ${result.error}`);
    }
    
    // Rate limiting - 100ms delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Import Summary:');
  console.log('='.repeat(70));
  console.log(`✅ Created: ${stats.created}`);
  console.log(`⏭️  Skipped (already exist): ${stats.skipped}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`📦 Total processed: ${stats.total}`);
  
  if (stats.errors.length > 0) {
    console.log('\n❌ Errors:');
    stats.errors.forEach(err => console.log(`   ${err}`));
  }
  
  console.log('='.repeat(70));
  console.log('\n✅ Import complete!');
  console.log(`\nView media at: ${CMS_URL}/admin/collections/media`);
}

// Check for required environment variables
if (!PAYLOAD_PASSWORD) {
  console.error('❌ Error: PAYLOAD_PASSWORD environment variable is required');
  console.error('Usage: PAYLOAD_PASSWORD=your_password node import-existing-cdn-media.js');
  process.exit(1);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
