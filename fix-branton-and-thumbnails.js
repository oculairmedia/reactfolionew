#!/usr/bin/env node

/**
 * Fix Script:
 * 1. Fix Branton hero - should be video
 * 2. Update all portfolio featured images to match project hero images
 */

require('dotenv').config({ path: '.env.payload' });
const axios = require('axios');

const API_BASE = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://192.168.50.90:3006';
const API_URL = `${API_BASE}/api`;

let authToken = null;

async function login() {
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email: process.env.PAYLOAD_EMAIL,
      password: process.env.PAYLOAD_PASSWORD
    });
    authToken = response.data.token;
    console.log('✅ Authenticated successfully\n');
    return authToken;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `JWT ${authToken}`
  };
}

async function getAllProjects() {
  try {
    const response = await axios.get(`${API_URL}/projects?limit=100`);
    return response.data.docs;
  } catch (error) {
    console.error('Error fetching projects:', error.message);
    return [];
  }
}

async function getAllPortfolioItems() {
  try {
    const response = await axios.get(`${API_URL}/portfolio?limit=100`);
    return response.data.docs;
  } catch (error) {
    console.error('Error fetching portfolio:', error.message);
    return [];
  }
}

async function getMediaByUrl(url) {
  try {
    // Try to find media by cdn_url
    const response = await axios.get(`${API_URL}/media?limit=100&where[cdn_url][equals]=${encodeURIComponent(url)}`);
    
    if (response.data.docs.length > 0) {
      return response.data.docs[0];
    }
    
    // Try without query params
    const cleanUrl = url.split('?')[0];
    const response2 = await axios.get(`${API_URL}/media?limit=100&where[cdn_url][equals]=${encodeURIComponent(cleanUrl)}`);
    
    if (response2.data.docs.length > 0) {
      return response2.data.docs[0];
    }
    
    return null;
  } catch (error) {
    console.error(`Error finding media for ${url}:`, error.message);
    return null;
  }
}

async function updateProject(projectId, updates) {
  try {
    const response = await axios.patch(
      `${API_URL}/projects/${projectId}`,
      updates,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating project ${projectId}:`, error.response?.data || error.message);
    return null;
  }
}

async function updatePortfolioItem(itemId, updates) {
  try {
    const response = await axios.patch(
      `${API_URL}/portfolio/${itemId}`,
      updates,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating portfolio item ${itemId}:`, error.response?.data || error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting fixes...\n');

  await login();

  // Get all data
  console.log('📥 Fetching all projects and portfolio items...');
  const projects = await getAllProjects();
  const portfolioItems = await getAllPortfolioItems();
  console.log(`Found ${projects.length} projects and ${portfolioItems.length} portfolio items\n`);

  // FIX 1: Update Branton hero to video
  console.log('=== FIX 1: BRANTON HERO VIDEO ===\n');
  const branton = projects.find(p => p.title === 'Branton');
  
  if (branton) {
    console.log('📝 Updating Branton hero to video...');
    console.log(`   Current: ${branton.hero?.type || 'not set'}`);
    
    const updated = await updateProject(branton.id, {
      hero: {
        type: 'video',
        video: 'https://oculair.b-cdn.net/api/v1/videos/f200bfc144e110dc4821384c82dca7d6fbd67c66/3rjei659/avc',
        alt: 'Branton Brand Animation'
      }
    });
    
    if (updated) {
      console.log('✅ Branton hero updated to video\n');
    }
  } else {
    console.error('❌ Branton project not found\n');
  }

  // FIX 2: Update portfolio featured images to match project heroes
  console.log('=== FIX 2: SYNC PORTFOLIO THUMBNAILS WITH PROJECT HEROES ===\n');
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const item of portfolioItems) {
    // Find the corresponding project by extracting slug from link
    // Link format: /projects/slug
    const slug = item.link?.replace('/projects/', '').replace('/', '');
    const project = projects.find(p => p.id === slug);
    
    if (!project) {
      console.log(`⚠️  ${item.title}: No linked project found (slug: ${slug})`);
      skipped++;
      continue;
    }

    // Get the hero image URL from project
    // For videos, use the poster image; for images, use the image
    const heroUrl = project.hero?.image;

    if (!heroUrl) {
      console.log(`⚠️  ${item.title}: Project has no hero image (type: ${project.hero?.type})`);
      skipped++;
      continue;
    }

    // Get current portfolio featured image URL
    const currentUrl = item.featuredImage?.cdn_url || item.featuredImage?.url;

    if (heroUrl === currentUrl) {
      console.log(`✓  ${item.title}: Already matches`);
      skipped++;
      continue;
    }

    // Find the media item for the hero image
    console.log(`🔄 ${item.title}:`);
    console.log(`   Current: ${currentUrl?.substring(0, 60)}...`);
    console.log(`   Target:  ${heroUrl?.substring(0, 60)}...`);
    
    const mediaItem = await getMediaByUrl(heroUrl);
    
    if (!mediaItem) {
      console.log(`   ❌ Could not find media item for hero image`);
      errors++;
      continue;
    }

    // Update portfolio item
    const result = await updatePortfolioItem(item.id, {
      featuredImage: mediaItem.id
    });

    if (result) {
      console.log(`   ✅ Updated to use hero image`);
      updated++;
    } else {
      console.log(`   ❌ Failed to update`);
      errors++;
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log(`✅ Updated: ${updated}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('\n🎉 Fixes complete!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
