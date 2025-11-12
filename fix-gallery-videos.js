#!/usr/bin/env node

/**
 * Fix Gallery Videos - Replace CDN video URLs with uploaded media IDs
 */

const CMS_URL = 'http://192.168.50.90:3006';
const PAYLOAD_EMAIL = 'emanuvaderland@gmail.com';
const PAYLOAD_PASSWORD = '7beEXKPk93xSD6m';

let authToken = null;

async function authenticate() {
  const response = await fetch(`${CMS_URL}/api/users/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email: PAYLOAD_EMAIL, password: PAYLOAD_PASSWORD})
  });
  const {token} = await response.json();
  authToken = token;
  console.log('✅ Authenticated\n');
}

async function getAllMedia() {
  const response = await fetch(`${CMS_URL}/api/media?limit=100`, {
    headers: {'Authorization': `JWT ${authToken}`}
  });
  const data = await response.json();
  return data.docs;
}

async function getProjects() {
  const response = await fetch(`${CMS_URL}/api/projects?limit=100&depth=0`, {
    headers: {'Authorization': `JWT ${authToken}`}
  });
  const data = await response.json();
  return data.docs;
}

async function updateProject(id, data) {
  const response = await fetch(`${CMS_URL}/api/projects/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `JWT ${authToken}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  
  return await response.json();
}

function isVideoUrl(url) {
  if (typeof url !== 'string') return false;
  return url.includes('/videos/') || url.includes('.mp4') || url.includes('.avc') || url.includes('.hevc');
}

async function main() {
  console.log('🎬 Fixing Gallery Videos...\n');
  
  await authenticate();
  
  const [allMedia, projects] = await Promise.all([
    getAllMedia(),
    getProjects()
  ]);
  
  // Get video media
  const videoMedia = allMedia.filter(m => m.mimeType && m.mimeType.includes('video'));
  console.log(`📦 Found ${videoMedia.length} video media items`);
  console.log(`📋 Found ${projects.length} projects\n`);
  
  let updated = 0;
  let skipped = 0;
  
  for (const project of projects) {
    if (!project.gallery || project.gallery.length === 0) {
      continue;
    }
    
    let hasChanges = false;
    const newGallery = [];
    
    for (const item of project.gallery) {
      // If it's already a media ID (not a URL), keep it
      if (typeof item.url === 'string' && item.url.length === 24 && !item.url.includes('://')) {
        newGallery.push(item);
        continue;
      }
      
      // Check if it's a video URL
      if (isVideoUrl(item.url)) {
        // For now, just mark it as video type but keep the URL
        // We'll need to manually map these to uploaded videos later
        newGallery.push({
          type: 'video',
          url: item.url,
          width: item.width || 'full'
        });
        hasChanges = true;
        console.log(`📹 ${project.title}: Found video in gallery - ${item.url.substring(0, 60)}...`);
      } else {
        newGallery.push(item);
      }
    }
    
    if (hasChanges) {
      try {
        await updateProject(project.id, {gallery: newGallery});
        console.log(`   ✅ Updated gallery structure\n`);
        updated++;
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}\n`);
      }
      await new Promise(r => setTimeout(r, 300));
    } else {
      skipped++;
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 Summary:');
  console.log('='.repeat(70));
  console.log(`✅ Updated: ${updated}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log('='.repeat(70));
  
  console.log('\n⚠️  Note: Video URLs still point to old CDN.');
  console.log('To fix completely, we need to:');
  console.log('1. Identify which uploaded videos match which gallery items');
  console.log('2. Update gallery items to use media IDs instead of URLs\n');
  
  // Show what videos we have
  console.log('📹 Available video media:');
  videoMedia.forEach(v => {
    console.log(`   - ${v.filename} (${v.alt}) - ID: ${v.id}`);
  });
}

main();
