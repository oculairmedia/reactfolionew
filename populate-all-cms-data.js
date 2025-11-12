#!/usr/bin/env node

/**
 * Populate ALL Payload CMS Data
 * 
 * Comprehensive script to populate:
 * - Portfolio collection (11 items)
 * - Projects collection (11 items)
 * - About Page global
 * - Home Intro global
 * - Site Settings global
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const CMS_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://cms2.emmanuelu.com';
const PAYLOAD_EMAIL = process.env.PAYLOAD_EMAIL || 'emanuvaderland@gmail.com';
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD;

let authToken = null;

// ============================================================================
// AUTHENTICATION
// ============================================================================

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

// ============================================================================
// MEDIA HELPERS
// ============================================================================

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

function extractFilename(url) {
  if (!url) return null;
  const match = url.match(/([^\/]+)\.(jpg|jpeg|png|gif|webp|mp4|avc)(\?|$)/i);
  return match ? match[1] : null;
}

// ============================================================================
// PORTFOLIO COLLECTION
// ============================================================================

async function createPortfolioItem(item, media) {
  try {
    const tags = Array.isArray(item.tags) 
      ? item.tags.map(t => typeof t === 'string' ? { tag: t } : t)
      : [];

    const payload = {
      id: item.id,
      title: item.title,
      description: item.description || '',
      isVideo: item.isVideo || false,
      link: item.link || `/projects/${item.id}`,
      date: item.date || new Date().toISOString().split('T')[0],
      tags: tags,
    };

    if (media) {
      payload.featuredImage = media.id;
      if (item.isVideo && item.video) {
        const videoFilename = extractFilename(item.video);
        if (videoFilename) {
          const videoMedia = await findMedia(videoFilename);
          if (videoMedia) {
            payload.featuredVideo = videoMedia.id;
          }
        }
      }
    }

    // Legacy fields
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

    console.log(`   ✅ Created: ${item.title}`);
    return response.data.doc;
  } catch (error) {
    console.error(`   ❌ Failed: ${item.title}`);
    if (error.response?.data) {
      console.error('   Error:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

async function populatePortfolio() {
  console.log('📦 PORTFOLIO COLLECTION');
  console.log('='.repeat(70));
  
  const portfolioDir = path.join(__dirname, 'src/content/portfolio');
  const files = fs.readdirSync(portfolioDir).filter(f => f.endsWith('.json'));
  
  console.log(`Found ${files.length} portfolio items\n`);

  const stats = { total: files.length, created: 0, failed: 0 };

  for (const file of files) {
    const content = fs.readFileSync(path.join(portfolioDir, file), 'utf-8');
    const item = JSON.parse(content);

    // Find matching media
    let media = null;
    if (item.img) {
      const filename = extractFilename(item.img);
      if (filename) {
        media = await findMedia(filename);
      }
    }

    const result = await createPortfolioItem(item, media);
    
    if (result) {
      stats.created++;
    } else {
      stats.failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`\n📊 Portfolio: ${stats.created}/${stats.total} created\n`);
  return stats;
}

// ============================================================================
// PROJECTS COLLECTION
// ============================================================================

async function createProjectItem(item) {
  try {
    // Transform tags
    const tags = Array.isArray(item.tags) 
      ? item.tags.map(t => typeof t === 'string' ? { tag: t } : t)
      : [];

    // Transform gallery: convert URL strings to {type, url} objects
    const gallery = Array.isArray(item.gallery)
      ? item.gallery.map(url => {
          if (typeof url === 'string') {
            return {
              type: url.match(/\.(mp4|webm|avi|mov|avc|hevc)$/i) ? 'video' : 'image',
              url: url,
              width: 'full'
            };
          }
          return url;
        })
      : [];

    // Ensure hero has required type field
    let hero = item.hero || {};
    if (!hero.type) {
      hero = {
        type: 'image',
        image: item.featured_image || (gallery[0]?.url || ''),
        ...hero
      };
    }

    const payload = {
      id: item.id,
      title: item.title,
      subtitle: item.subtitle || '',
      metadata: item.metadata || {},
      hero: hero,
      tags: tags,
      sections: item.sections || [],
      gallery: gallery,
    };

    const response = await axios.post(
      `${CMS_URL}/api/projects`,
      payload,
      {
        headers: {
          'Authorization': `JWT ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`   ✅ Created: ${item.title}`);
    return response.data.doc;
  } catch (error) {
    console.error(`   ❌ Failed: ${item.title}`);
    if (error.response?.data) {
      console.error('   Error:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

async function populateProjects() {
  console.log('📦 PROJECTS COLLECTION');
  console.log('='.repeat(70));
  
  const projectsDir = path.join(__dirname, 'src/content/projects');
  const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.json'));
  
  console.log(`Found ${files.length} project items\n`);

  const stats = { total: files.length, created: 0, failed: 0 };

  for (const file of files) {
    const content = fs.readFileSync(path.join(projectsDir, file), 'utf-8');
    const item = JSON.parse(content);

    const result = await createProjectItem(item);
    
    if (result) {
      stats.created++;
    } else {
      stats.failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`\n📊 Projects: ${stats.created}/${stats.total} created\n`);
  return stats;
}

// ============================================================================
// GLOBALS
// ============================================================================

async function updateGlobal(slug, data) {
  try {
    const response = await axios.post(
      `${CMS_URL}/api/globals/${slug}`,
      data,
      {
        headers: {
          'Authorization': `JWT ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`   ✅ Updated: ${slug}`);
    return response.data;
  } catch (error) {
    console.error(`   ❌ Failed: ${slug}`);
    if (error.response?.data) {
      console.error('   Error:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

async function populateGlobals() {
  console.log('🌍 GLOBAL DATA');
  console.log('='.repeat(70));

  const stats = { total: 3, created: 0, failed: 0 };

  // 1. About Page
  console.log('\n1. About Page Global...');
  const aboutData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'src/content/about/about.json'), 'utf-8')
  );
  const aboutResult = await updateGlobal('about-page', aboutData);
  if (aboutResult) stats.created++; else stats.failed++;
  await new Promise(resolve => setTimeout(resolve, 300));

  // 2. Home Intro
  console.log('2. Home Intro Global...');
  const homeData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'src/content/intro/home.json'), 'utf-8')
  );
  const homeResult = await updateGlobal('home-intro', homeData);
  if (homeResult) stats.created++; else stats.failed++;
  await new Promise(resolve => setTimeout(resolve, 300));

  // 3. Site Settings (if global exists)
  console.log('3. Site Settings Global...');
  const settingsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'src/content/settings/site-settings.json'), 'utf-8')
  );
  const settingsResult = await updateGlobal('site-settings', settingsData);
  if (settingsResult) stats.created++; else stats.failed++;

  console.log(`\n📊 Globals: ${stats.created}/${stats.total} updated\n`);
  return stats;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 POPULATE ALL CMS DATA');
  console.log('='.repeat(70) + '\n');
  
  if (!PAYLOAD_PASSWORD) {
    console.error('❌ Error: PAYLOAD_PASSWORD environment variable is required');
    console.error('Usage: PAYLOAD_PASSWORD=your_password node populate-all-cms-data.js\n');
    process.exit(1);
  }

  await authenticate();

  const allStats = {
    portfolio: null,
    projects: null,
    globals: null,
  };

  try {
    // 1. Portfolio Collection
    allStats.portfolio = await populatePortfolio();
    
    // 2. Projects Collection
    allStats.projects = await populateProjects();
    
    // 3. Globals
    allStats.globals = await populateGlobals();

    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(70));
    
    const totalCreated = 
      allStats.portfolio.created + 
      allStats.projects.created + 
      allStats.globals.created;
    
    const totalItems = 
      allStats.portfolio.total + 
      allStats.projects.total + 
      allStats.globals.total;
    
    const totalFailed = 
      allStats.portfolio.failed + 
      allStats.projects.failed + 
      allStats.globals.failed;

    console.log(`✅ Portfolio Items: ${allStats.portfolio.created}/${allStats.portfolio.total}`);
    console.log(`✅ Project Items: ${allStats.projects.created}/${allStats.projects.total}`);
    console.log(`✅ Global Data: ${allStats.globals.created}/${allStats.globals.total}`);
    console.log('─'.repeat(70));
    console.log(`📦 Total Created: ${totalCreated}/${totalItems}`);
    console.log(`❌ Total Failed: ${totalFailed}`);
    console.log('='.repeat(70));
    
    if (totalFailed === 0) {
      console.log('\n🎉 SUCCESS! All data populated successfully!');
    } else {
      console.log(`\n⚠️  Completed with ${totalFailed} failures. Check errors above.`);
    }
    
    console.log(`\n🔗 View CMS: ${CMS_URL}/admin`);
    console.log(`   - Portfolio: ${CMS_URL}/admin/collections/portfolio`);
    console.log(`   - Projects: ${CMS_URL}/admin/collections/projects`);
    console.log(`   - About: ${CMS_URL}/admin/globals/about-page`);
    console.log(`   - Home: ${CMS_URL}/admin/globals/home-intro\n`);

  } catch (error) {
    console.error('\n❌ Fatal error during population:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
