#!/usr/bin/env node

/**
 * Link Media to Portfolio and Project Items (v2)
 * 
 * Better matching algorithm that handles punctuation and special characters
 */

const CMS_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://192.168.50.90:3006';
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
    console.log('✅ Authenticated successfully\n');
    return authToken;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    process.exit(1);
  }
}

// Fetch all media
async function getAllMedia() {
  const response = await fetch(`${CMS_URL}/api/media?limit=1000`, {
    headers: { 'Authorization': `JWT ${authToken}` },
  });
  const data = await response.json();
  return data.docs || [];
}

// Fetch all portfolio items
async function getAllPortfolio() {
  const response = await fetch(`${CMS_URL}/api/portfolio?limit=100&depth=0`, {
    headers: { 'Authorization': `JWT ${authToken}` },
  });
  const data = await response.json();
  return data.docs || [];
}

// Fetch all projects
async function getAllProjects() {
  const response = await fetch(`${CMS_URL}/api/projects?limit=100&depth=0`, {
    headers: { 'Authorization': `JWT ${authToken}` },
  });
  const data = await response.json();
  return data.docs || [];
}

// Update portfolio item
async function updatePortfolio(id, data) {
  try {
    const response = await fetch(`${CMS_URL}/api/portfolio/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to update portfolio ${id}:`, error.message);
    return null;
  }
}

// Update project
async function updateProject(id, data) {
  try {
    const response = await fetch(`${CMS_URL}/api/projects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to update project ${id}:`, error.message);
    return null;
  }
}

// Normalize text for matching (remove punctuation, spaces, etc.)
function normalizeForMatching(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric
    .trim();
}

// Find media by keyword matching with better algorithm
function findMediaByKeyword(mediaList, keyword) {
  const normalized = normalizeForMatching(keyword);
  
  // First, try exact match
  let match = mediaList.find(media => {
    const mediaName = normalizeForMatching(media.alt || media.filename || '');
    return mediaName === normalized;
  });
  
  if (match) return match;
  
  // Then, try contains match (both directions)
  match = mediaList.find(media => {
    const mediaName = normalizeForMatching(media.alt || media.filename || '');
    return mediaName.includes(normalized) || normalized.includes(mediaName);
  });
  
  return match;
}

// Find all media matching a keyword (for galleries)
function findAllMediaByKeyword(mediaList, keyword, excludeId = null) {
  const normalized = normalizeForMatching(keyword);
  
  return mediaList.filter(media => {
    if (media.id === excludeId) return false;
    const mediaName = normalizeForMatching(media.alt || media.filename || '');
    return mediaName.includes(normalized) && mediaName !== normalized;
  });
}

// Main execution
async function main() {
  console.log('🔗 Linking Media to Content Items (v2)...\n');
  
  await authenticate();
  
  console.log('📥 Fetching data...');
  const [allMedia, allPortfolio, allProjects] = await Promise.all([
    getAllMedia(),
    getAllPortfolio(),
    getAllProjects()
  ]);
  
  console.log(`   Media: ${allMedia.length}`);
  console.log(`   Portfolio: ${allPortfolio.length}`);
  console.log(`   Projects: ${allProjects.length}\n`);
  
  let stats = {
    portfolioUpdated: 0,
    projectsUpdated: 0,
    failed: 0,
    skipped: 0
  };
  
  // Link portfolio items
  console.log('📌 Linking Portfolio Items...\n');
  for (const item of allPortfolio) {
    // Skip if already has media
    if (item.hero || item.featured_image) {
      console.log(`⏭️  ${item.title} → Already linked`);
      stats.skipped++;
      continue;
    }
    
    const media = findMediaByKeyword(allMedia, item.title);
    
    if (media) {
      console.log(`✅ ${item.title} → ${media.alt || media.filename}`);
      const result = await updatePortfolio(item.id, {
        hero: media.id,
        featured_image: media.id
      });
      if (result) {
        stats.portfolioUpdated++;
      } else {
        stats.failed++;
      }
    } else {
      console.log(`⚠️  ${item.title} → No media found`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Link projects
  console.log('\n📌 Linking Projects...\n');
  for (const project of allProjects) {
    // Skip if already has media
    if (project.hero) {
      console.log(`⏭️  ${project.title} → Already linked`);
      stats.skipped++;
      continue;
    }
    
    const heroMedia = findMediaByKeyword(allMedia, project.title);
    
    if (heroMedia) {
      console.log(`✅ ${project.title} → ${heroMedia.alt || heroMedia.filename}`);
      
      // Also find gallery images for this project
      const galleryMedia = findAllMediaByKeyword(allMedia, project.title, heroMedia.id);
      
      const updateData = {
        hero: {
          type: 'image',
          url: heroMedia.id
        }
      };
      
      // Add gallery if we found related images
      if (galleryMedia.length > 0) {
        updateData.gallery = galleryMedia.map(m => ({
          type: 'image',
          url: m.id,
          width: 1200
        }));
        console.log(`   └─ Added ${galleryMedia.length} gallery images`);
      }
      
      const result = await updateProject(project.id, updateData);
      if (result) {
        stats.projectsUpdated++;
      } else {
        stats.failed++;
      }
    } else {
      console.log(`⚠️  ${project.title} → No media found`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Summary:');
  console.log('='.repeat(70));
  console.log(`✅ Portfolio items updated: ${stats.portfolioUpdated}`);
  console.log(`✅ Projects updated: ${stats.projectsUpdated}`);
  console.log(`⏭️  Skipped (already linked): ${stats.skipped}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log('='.repeat(70));
  console.log('\n✅ Linking complete!');
  console.log(`\nView portfolio at: ${CMS_URL}/admin/collections/portfolio`);
  console.log(`View projects at: ${CMS_URL}/admin/collections/projects`);
}

if (!PAYLOAD_PASSWORD) {
  console.error('❌ Error: PAYLOAD_PASSWORD environment variable is required');
  console.error('Usage: PAYLOAD_PASSWORD=your_password node link-media-to-content-v2.js');
  process.exit(1);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
