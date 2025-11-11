#!/usr/bin/env node

/**
 * Import CDN Media by Downloading and Re-uploading (Axios version)
 * 
 * Downloads each CDN image/video and uploads it properly to Payload
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Simple MIME type detection based on file extension or URL pattern
function getMimeType(url, filename) {
  // Check if URL is a video API endpoint
  if (url.includes('/api/v1/videos/')) {
    // These are video files - use mp4 as default
    return 'video/mp4';
  }
  
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.avc': 'video/mp4',
    '.hevc': 'video/mp4',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Configuration
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

// Download file from URL
async function downloadFile(url) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    maxRedirects: 5,
  });
  return Buffer.from(response.data);
}

// Check if media already exists
async function mediaExists(cdnUrl) {
  try {
    const response = await axios.get(
      `${CMS_URL}/api/media?where[cdn_url][equals]=${encodeURIComponent(cdnUrl)}&limit=1`,
      {
        headers: { 'Authorization': `JWT ${authToken}` },
      }
    );

    return response.data.docs && response.data.docs.length > 0;
  } catch (error) {
    return false;
  }
}

// Generate filename from URL
function getFilenameFromUrl(url) {
  const urlPath = url.split('?')[0];
  let filename = urlPath.split('/').pop() || 'download';
  
  // If it's a video API URL and has no proper extension, add .mp4
  if (url.includes('/api/v1/videos/') && !filename.match(/\.(mp4|webm|mov|avi)$/i)) {
    filename = filename + '.mp4';
  }
  
  // If avc/hevc files don't have extension, add .mp4
  if (filename.match(/\.(avc|hevc)$/i)) {
    filename = filename.replace(/\.(avc|hevc)$/i, '.mp4');
  }
  
  return filename;
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
    const formData = new FormData();
    
    // Detect proper MIME type
    const mimeType = getMimeType(cdnUrl, filename);
    
    // Add file
    formData.append('file', fileBuffer, {
      filename: filename,
      contentType: mimeType,
    });
    
    // Add metadata
    formData.append('alt', generateAltText(filename));
    formData.append('cdn_url', cdnUrl);
    formData.append('source', 'cdn');

    const response = await axios.post(`${CMS_URL}/api/media`, formData, {
      headers: {
        'Authorization': `JWT ${authToken}`,
        ...formData.getHeaders(),
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    return { success: true, data: response.data };
  } catch (error) {
    const errorMsg = error.response?.data 
      ? JSON.stringify(error.response.data) 
      : error.message;
    return { 
      success: false, 
      error: errorMsg
    };
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
    const fileSizeMB = fileBuffer.length / (1024 * 1024);
    console.log(`   Downloaded ${(fileBuffer.length / 1024).toFixed(1)} KB`);
    
    // Skip files larger than 100MB (Payload may have limits)
    if (fileSizeMB > 100) {
      console.log(`   ⚠️  Skipping - File too large (${fileSizeMB.toFixed(1)}MB)`);
      return { skipped: true, reason: 'too_large' };
    }

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
  console.error('Usage: PAYLOAD_PASSWORD=your_password node import-cdn-media-axios.js');
  process.exit(1);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
