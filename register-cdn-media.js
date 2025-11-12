#!/usr/bin/env node

/**
 * Register existing CDN media URLs as Media entries in Payload CMS
 * This creates media records that reference external CDN URLs without uploading files
 */

const fs = require('fs');
const axios = require('axios');

const CMS_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://192.168.50.90:3006';
const PAYLOAD_EMAIL = process.env.PAYLOAD_EMAIL || 'emanuvaderland@gmail.com';
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD;

let authToken = null;

// Authenticate with Payload CMS
async function authenticate() {
  try {
    const response = await axios.post(`${CMS_URL}/api/users/login`, {
      email: PAYLOAD_EMAIL,
      password: PAYLOAD_PASSWORD,
    });

    authToken = response.data.token;
    console.log('✅ Authenticated successfully\n');
    return authToken;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    process.exit(1);
  }
}

// Extract filename from URL
function getFilenameFromUrl(url) {
  const match = url.match(/([^\/]+)\.(jpg|jpeg|png|gif|webp|mp4|avc|hevc)(\?|$)/i);
  return match ? match[1] : 'untitled';
}

// Determine media type from URL
function getMediaType(url) {
  return url.match(/\.(mp4|webm|avi|mov|avc|hevc)$/i) ? 'video' : 'image';
}

// Create media entry
async function createMedia(url) {
  try {
    const filename = getFilenameFromUrl(url);
    const mediaType = getMediaType(url);
    
    const payload = {
      cdn_url: url,
      source: 'cdn',
      alt: filename,
      media_type: mediaType,
    };

    const response = await axios.post(
      `${CMS_URL}/api/media`,
      payload,
      {
        headers: {
          'Authorization': `JWT ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
}

// Main execution
async function main() {
  console.log('📤 Registering CDN Media URLs\n');
  console.log('='.repeat(70));

  if (!PAYLOAD_PASSWORD) {
    console.error('❌ Error: PAYLOAD_PASSWORD environment variable is required');
    console.error('Usage: PAYLOAD_PASSWORD=your_password node register-cdn-media.js\n');
    process.exit(1);
  }

  // Read CDN URLs
  const urls = fs.readFileSync('cdn-images-found.txt', 'utf-8')
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0);

  console.log(`📊 Found ${urls.length} CDN URLs to register\n`);

  await authenticate();

  let created = 0;
  let failed = 0;

  for (const url of urls) {
    const result = await createMedia(url);
    
    if (result.success) {
      created++;
      console.log(`✅ Registered: ${url.substring(url.lastIndexOf('/') + 1)}`);
    } else {
      failed++;
      console.error(`❌ Failed: ${url}`);
      console.error(`   Error: ${JSON.stringify(result.error)}`);
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 Summary:');
  console.log(`✅ Registered: ${created}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📦 Total: ${urls.length}`);
  console.log('='.repeat(70));
}

main().catch(console.error);
