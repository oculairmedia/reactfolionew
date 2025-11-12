#!/usr/bin/env node

/**
 * Fix Video Portfolio Thumbnails:
 * - For video projects, set isVideo: true in portfolio
 * - Use the video URL instead of static image for thumbnails
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

async function updatePortfolioItem(itemId, updates) {
  try {
    const response = await axios.patch(
      `${API_URL}/portfolio/${itemId}`,
      updates,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating portfolio ${itemId}:`, error.response?.data || error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Fixing video portfolio thumbnails...\n');

  await login();

  const projectsRes = await axios.get(`${API_URL}/projects?limit=100`);
  const portfolioRes = await axios.get(`${API_URL}/portfolio?limit=100`);
  
  const projects = projectsRes.data.docs;
  const portfolioItems = portfolioRes.data.docs;

  console.log(`Found ${projects.length} projects and ${portfolioItems.length} portfolio items\n`);

  // Find video projects
  const videoProjects = projects.filter(p => p.hero?.type === 'video');
  console.log(`Found ${videoProjects.length} video projects\n`);

  let updated = 0;
  let skipped = 0;

  for (const project of videoProjects) {
    // Find corresponding portfolio item
    const portfolioItem = portfolioItems.find(p => {
      const slug = p.link?.replace('/projects/', '').replace('/', '');
      return slug === project.id;
    });

    if (!portfolioItem) {
      console.log(`⚠️  ${project.title}: No portfolio item found`);
      skipped++;
      continue;
    }

    const videoUrl = project.hero.video;
    
    if (!videoUrl) {
      console.log(`⚠️  ${project.title}: No video URL in project hero`);
      skipped++;
      continue;
    }

    // Check if already set correctly
    if (portfolioItem.isVideo && portfolioItem.img === videoUrl) {
      console.log(`✓  ${project.title}: Already set to video`);
      skipped++;
      continue;
    }

    console.log(`🔄 ${project.title}:`);
    console.log(`   Setting isVideo: true`);
    console.log(`   Video URL: ${videoUrl.substring(0, 60)}...`);

    const result = await updatePortfolioItem(portfolioItem.id, {
      isVideo: true,
      img: videoUrl
    });

    if (result) {
      console.log(`   ✅ Updated to use video thumbnail\n`);
      updated++;
    } else {
      console.log(`   ❌ Failed to update\n`);
    }
  }

  console.log('=== SUMMARY ===');
  console.log(`✅ Updated: ${updated}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log('\n🎉 Video portfolio thumbnails now show animations!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
