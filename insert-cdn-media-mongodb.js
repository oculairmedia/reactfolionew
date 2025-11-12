#!/usr/bin/env node

/**
 * Insert CDN Media Directly into MongoDB
 * 
 * Bypasses Payload's upload validation by inserting directly into MongoDB
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27018/personal-site';

// Generate alt text from URL
function generateAltText(url) {
  const filename = url.split('/').pop().split('?')[0];
  const nameWithoutHash = filename.replace(/^[a-f0-9]{40}\./, '');
  const nameWithoutExt = nameWithoutHash.replace(/\.[^.]+$/, '');
  
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

async function main() {
  console.log('🔍 Starting Direct MongoDB CDN Media Import...\n');
  
  // Read CDN URLs from file
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
  
  // Connect to MongoDB
  console.log(`Connecting to MongoDB: ${MONGO_URL}...`);
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log('✅ Connected to MongoDB\n');
  
  const db = client.db();
  const mediaCollection = db.collection('media');
  
  console.log('📤 Inserting media documents...\n');
  
  let stats = {
    total: cdnUrls.length,
    created: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };
  
  for (const cdnUrl of cdnUrls) {
    try {
      // Check if already exists
      const existing = await mediaCollection.findOne({ cdn_url: cdnUrl });
      
      if (existing) {
        console.log(`⏭️  Skipping (already exists): ${cdnUrl.substring(0, 60)}...`);
        stats.skipped++;
        continue;
      }
      
      const mediaType = getMediaType(cdnUrl);
      const altText = generateAltText(cdnUrl);
      const caption = getSourceContext(cdnUrl);
      
      const now = new Date();
      
      const mediaDoc = {
        cdn_url: cdnUrl,
        source: 'cdn',
        media_type: mediaType,
        alt: altText,
        caption: caption,
        cdn_synced: true,
        cdn_uploaded_at: now,
        createdAt: now,
        updatedAt: now,
      };
      
      await mediaCollection.insertOne(mediaDoc);
      console.log(`✅ Created: ${altText} (${mediaType})`);
      stats.created++;
      
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
      stats.failed++;
      stats.errors.push(`${cdnUrl}: ${error.message}`);
    }
  }
  
  await client.close();
  
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
  console.log(`\nView media at: http://192.168.50.90:3006/admin/collections/media`);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
