#!/usr/bin/env node

/**
 * Import CDN Media to Payload CMS
 * 
 * This script scans the codebase for CDN image/video URLs and imports them
 * into Payload CMS as Media collection entries (without duplicating files).
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CMS_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://cms2.emmanuelu.com';
const PAYLOAD_EMAIL = process.env.PAYLOAD_EMAIL || 'admin@emmanuelu.com';
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD;

const CDN_BASE = 'https://oculair.b-cdn.net';

// Regex to find CDN URLs in JSON files
const CDN_IMAGE_REGEX = /https:\/\/oculair\.b-cdn\.net\/cache\/images\/([^"']+\.(jpg|jpeg|png|webp|gif|svg))/gi;
const CDN_VIDEO_REGEX = /https:\/\/oculair\.b-cdn\.net\/api\/v1\/videos\/([^"']+)/gi;

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

// Check if media already exists in CMS
async function mediaExists(cdnUrl) {
  try {
    const response = await fetch(
      `${CMS_URL}/api/media?where[cdn_url][equals]=${encodeURIComponent(cdnUrl)}&limit=1`,
      {
        headers: {
          'Authorization': `JWT ${authToken}`,
        },
      }
    );

    const data = await response.json();
    return data.docs && data.docs.length > 0;
  } catch (error) {
    console.error(`Error checking media existence: ${error.message}`);
    return false;
  }
}

// Create media entry in Payload
async function createMediaEntry(mediaData) {
  try {
    const exists = await mediaExists(mediaData.cdn_url);
    
    if (exists) {
      console.log(`⏭️  Skipping (already exists): ${mediaData.cdn_url}`);
      return null;
    }

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
    console.log(`✅ Created: ${mediaData.alt || mediaData.cdn_url}`);
    return data;
  } catch (error) {
    console.error(`❌ Failed to create media entry: ${error.message}`);
    return null;
  }
}

// Extract filename from CDN URL for alt text
function generateAltText(url) {
  const filename = url.split('/').pop().split('?')[0];
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
  const nameWithoutHash = nameWithoutExt.replace(/^[a-f0-9]{40}/, ''); // Remove SHA hash
  
  if (nameWithoutHash) {
    return nameWithoutHash
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
  
  return filename;
}

// Scan directory for CDN URLs in JSON files
function scanForCDNUrls(directory) {
  const cdnUrls = new Set();
  
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
        scanDir(filePath);
      } else if (file.endsWith('.json') || file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Find image URLs
        let match;
        while ((match = CDN_IMAGE_REGEX.exec(content)) !== null) {
          cdnUrls.add({
            url: match[0],
            type: 'image',
            source: filePath,
          });
        }
        
        // Find video URLs
        while ((match = CDN_VIDEO_REGEX.exec(content)) !== null) {
          cdnUrls.add({
            url: match[0],
            type: 'video',
            source: filePath,
          });
        }
      }
    }
  }
  
  scanDir(directory);
  return Array.from(cdnUrls);
}

// Main execution
async function main() {
  console.log('🔍 Scanning for CDN media URLs...\n');
  
  // Scan src directory for CDN URLs
  const contentDir = path.join(__dirname, 'src/content');
  const cdnMedia = scanForCDNUrls(contentDir);
  
  console.log(`\n📊 Found ${cdnMedia.length} unique CDN media references\n`);
  
  if (cdnMedia.length === 0) {
    console.log('No CDN URLs found. Exiting.');
    return;
  }
  
  // Authenticate
  await authenticate();
  
  console.log('\n📤 Importing media to Payload CMS...\n');
  
  let imported = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const media of cdnMedia) {
    const mediaData = {
      cdn_url: media.url,
      source: 'cdn',
      media_type: media.type,
      alt: generateAltText(media.url),
      caption: `Imported from ${path.basename(media.source)}`,
    };
    
    const result = await createMediaEntry(mediaData);
    
    if (result) {
      imported++;
    } else if (await mediaExists(media.url)) {
      skipped++;
    } else {
      failed++;
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Import Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Imported: ${imported}`);
  console.log(`⏭️  Skipped (already exist): ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📦 Total processed: ${cdnMedia.length}`);
  console.log('='.repeat(60));
}

// Check for required environment variables
if (!PAYLOAD_PASSWORD) {
  console.error('❌ Error: PAYLOAD_PASSWORD environment variable is required');
  console.error('Usage: PAYLOAD_PASSWORD=your_password node import-cdn-media.js');
  process.exit(1);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
