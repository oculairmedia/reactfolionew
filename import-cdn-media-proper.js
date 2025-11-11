#!/usr/bin/env node

/**
 * Import CDN Media by Downloading and Re-uploading
 * 
 * Downloads each CDN image/video and uploads it properly to Payload
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CMS_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://cms2.emmanuelu.com';
const PAYLOAD_EMAIL = process.env.PAYLOAD_EMAIL || 'emanuvaderland@gmail.com';
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD;

let authToken = null;

// Authenticate
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

// Download file from URL
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        return downloadFile(response.headers.location)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
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
    return false;
  }
}

// Generate filename from URL
function getFilenameFromUrl(url) {
  const urlPath = url.split('?')[0];
  return urlPath.split('/').pop() || 'download';
}

// Generate alt text from filename
function generateAltText(filename) {
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
  const nameWithoutHash = nameWithoutExt.replace(/^[a-f0-9]{40}/, '');
  
  if (nameWithoutHash) {
    return nameWithoutHash
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
  
  return filename;
}

// Upload file to Payload
async function uploadToPayload(cdnUrl, fileBuffer, filename) {
  try {
    // Create form data
    const FormData = (await import('node:buffer')).Blob ? 
      (await import('undici')).FormData : 
      require('form-data');
    
    const formData = new FormData();
    
    // Add file
    const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
    formData.append('file', blob, filename);
    
    // Add metadata
    formData.append('alt', generateAltText(filename));
    formData.append('cdn_url', cdnUrl);
    formData.append('source', 'cdn');

    const response = await fetch(`${CMS_URL}/api/media`, {
      method: 'POST',
      headers: {
        'Authorization': `JWT ${authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Process single CDN URL
async function processCDNUrl(cdnUrl) {
  try {
    // Check if already exists
    if (await mediaExists(cdnUrl)) {
      console.log(`⏭️  Skipping: ${cdnUrl.substring(0, 60)}...`);
      return { skipped: true };
    }

    console.log(`📥 Downloading: ${cdnUrl.substring(0, 60)}...`);
    
    // Download file
    const fileBuffer = await downloadFile(cdnUrl);
    console.log(`   Downloaded ${(fileBuffer.length / 1024).toFixed(1)} KB`);

    // Get filename
    const filename = getFilenameFromUrl(cdnUrl);
    
    // Upload to Payload
    console.log(`📤 Uploading to Payload...`);
    const result = await uploadToPayload(cdnUrl, fileBuffer, filename);

    if (result.success) {
      console.log(`✅ Created: ${generateAltText(filename)}`);
      return { created: true };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return { failed: true, error: error.message };
  }
}

// Main execution
async function main() {
  console.log('🔍 Starting CDN Media Import (Download & Upload)...\n');
  
  // Read CDN URLs
  const cdnUrlsFile = path.join(__dirname, 'cdn-images-found.txt');
  
  if (!fs.existsSync(cdnUrlsFile)) {
    console.error('❌ cdn-images-found.txt not found!');
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
  
  console.log('\n📤 Downloading and uploading media...\n');
  
  let stats = {
    total: cdnUrls.length,
    created: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };
  
  for (const cdnUrl of cdnUrls) {
    const result = await processCDNUrl(cdnUrl);
    
    if (result.created) {
      stats.created++;
    } else if (result.skipped) {
      stats.skipped++;
    } else if (result.failed) {
      stats.failed++;
      stats.errors.push(`${cdnUrl}: ${result.error}`);
    }
    
    // Rate limiting - 500ms delay between uploads
    await new Promise(resolve => setTimeout(resolve, 500));
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
    console.log('\n❌ Errors (first 10):');
    stats.errors.slice(0, 10).forEach(err => console.log(`   ${err}`));
  }
  
  console.log('='.repeat(70));
  console.log('\n✅ Import complete!');
  console.log(`\nView media at: ${CMS_URL}/admin/collections/media`);
}

// Check for required environment variables
if (!PAYLOAD_PASSWORD) {
  console.error('❌ Error: PAYLOAD_PASSWORD environment variable is required');
  console.error('Usage: PAYLOAD_PASSWORD=your_password node import-cdn-media-proper.js');
  process.exit(1);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
