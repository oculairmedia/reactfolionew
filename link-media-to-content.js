#!/usr/bin/env node

/**
 * Link Media to Portfolio and Project Items
 * 
 * Matches uploaded media files to portfolio/project items based on naming patterns
 * and updates the database to link them together.
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

// Find media by keyword matching
function findMediaByKeyword(mediaList, keyword) {
  const normalized = keyword.toLowerCase().replace(/[-_\s]/g, '');
  return mediaList.find(media => {
    const mediaName = (media.alt || media.filename || '').toLowerCase().replace(/[-_\s]/g, '');
    return mediaName.includes(normalized) || normalized.includes(mediaName);
  });
}

// Main execution
async function main() {
  console.log('🔗 Linking Media to Content Items...\n');
  
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
    failed: 0
  };
  
  // Link portfolio items
  console.log('📌 Linking Portfolio Items...\n');
  for (const item of allPortfolio) {
    const media = findMediaByKeyword(allMedia, item.title);
    
    if (media) {
      console.log(`✅ ${item.title} → ${media.filename}`);
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
    const heroMedia = findMediaByKeyword(allMedia, project.title);
    
    if (heroMedia) {
      console.log(`✅ ${project.title} → ${heroMedia.filename}`);
      
      // Also find gallery images for this project
      const projectKeyword = project.title.toLowerCase().replace(/[-_\s]/g, '');
      const galleryMedia = allMedia.filter(media => {
        const mediaName = (media.alt || media.filename || '').toLowerCase().replace(/[-_\s]/g, '');
        return mediaName.includes(projectKeyword) && media.id !== heroMedia.id;
      });
      
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
  console.log(`❌ Failed: ${stats.failed}`);
  console.log('='.repeat(70));
  console.log('\n✅ Linking complete!');
  console.log(`\nView portfolio at: ${CMS_URL}/admin/collections/portfolio`);
  console.log(`View projects at: ${CMS_URL}/admin/collections/projects`);
}

if (!PAYLOAD_PASSWORD) {
  console.error('❌ Error: PAYLOAD_PASSWORD environment variable is required');
  console.error('Usage: PAYLOAD_PASSWORD=your_password node link-media-to-content.js');
  process.exit(1);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
