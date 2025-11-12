#!/usr/bin/env node

/**
 * Sync Portfolio Thumbnails:
 * - For video projects: Add a poster image to hero.image and use that for portfolio
 * - For image projects: Use the hero.image for portfolio thumbnail
 * - Update Branton and Aquatic Resonance to have poster images
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
    console.error(`Error updating portfolio ${itemId}:`, error.response?.data || error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Syncing portfolio thumbnails with project heroes...\n');

  await login();

  const projectsRes = await axios.get(`${API_URL}/projects?limit=100`);
  const portfolioRes = await axios.get(`${API_URL}/portfolio?limit=100`);
  
  const projects = projectsRes.data.docs;
  const portfolioItems = portfolioRes.data.docs;

  console.log(`Found ${projects.length} projects and ${portfolioItems.length} portfolio items\n`);

  // STEP 1: Fix video projects to have poster images
  console.log('=== STEP 1: ADD POSTER IMAGES TO VIDEO PROJECTS ===\n');

  const brantonProject = projects.find(p => p.title === 'Branton');
  const aquaticProject = projects.find(p => p.title === 'Aquatic Resonance');
  const binmetricsProject = projects.find(p => p.title === 'Binmetrics');

  // Branton: needs poster image
  if (brantonProject && brantonProject.hero?.type === 'video' && !brantonProject.hero?.image) {
    console.log('📝 Branton: Adding poster image to video hero...');
    const updated = await updateProject(brantonProject.id, {
      hero: {
        ...brantonProject.hero,
        image: 'https://oculair.b-cdn.net/cache/images/projects/work_branton_cover.jpg'
      }
    });
    if (updated) {
      console.log('✅ Branton poster image added\n');
      brantonProject.hero.image = 'https://oculair.b-cdn.net/cache/images/projects/work_branton_cover.jpg';
    }
  }

  // Aquatic Resonance: needs poster image
  if (aquaticProject && aquaticProject.hero?.type === 'video' && !aquaticProject.hero?.image) {
    console.log('📝 Aquatic Resonance: Adding poster image to video hero...');
    const updated = await updateProject(aquaticProject.id, {
      hero: {
        ...aquaticProject.hero,
        image: 'https://oculair.b-cdn.net/cache/images/28690189625a7d5ecf17b50f2ebe46fa7a7c7ee4.jpg'
      }
    });
    if (updated) {
      console.log('✅ Aquatic Resonance poster image added\n');
      aquaticProject.hero.image = 'https://oculair.b-cdn.net/cache/images/28690189625a7d5ecf17b50f2ebe46fa7a7c7ee4.jpg';
    }
  }

  // Binmetrics: should already have image
  if (binmetricsProject && binmetricsProject.hero?.type === 'video' && !binmetricsProject.hero?.image) {
    console.log('📝 Binmetrics: Adding poster image to video hero...');
    const updated = await updateProject(binmetricsProject.id, {
      hero: {
        ...binmetricsProject.hero,
        image: 'https://oculair.b-cdn.net/cache/images/cd3938b537ae6d5b28caf0c6863f6f07187f3a45.jpg'
      }
    });
    if (updated) {
      console.log('✅ Binmetrics poster image added\n');
      binmetricsProject.hero.image = 'https://oculair.b-cdn.net/cache/images/cd3938b537ae6d5b28caf0c6863f6f07187f3a45.jpg';
    }
  }

  // STEP 2: Update portfolio thumbnails to use hero images as direct URLs
  console.log('=== STEP 2: UPDATE PORTFOLIO THUMBNAILS ===\n');

  let updated = 0;
  let skipped = 0;

  for (const item of portfolioItems) {
    const slug = item.link?.replace('/projects/', '').replace('/', '');
    const project = projects.find(p => p.id === slug);
    
    if (!project) {
      console.log(`⚠️  ${item.title}: No project found (slug: ${slug})`);
      skipped++;
      continue;
    }

    const heroImageUrl = project.hero?.image;
    
    if (!heroImageUrl) {
      console.log(`⚠️  ${item.title}: Project has no hero image`);
      skipped++;
      continue;
    }

    const currentImageUrl = item.featuredImage?.cdn_url || item.featuredImage?.url;

    // Check if they already match
    if (currentImageUrl === heroImageUrl) {
      console.log(`✓  ${item.title}: Already synced`);
      skipped++;
      continue;
    }

    // Instead of linking to media, just set the img field directly
    console.log(`🔄 ${item.title}:`);
    console.log(`   From: ${currentImageUrl?.substring(0, 50)}...`);
    console.log(`   To:   ${heroImageUrl?.substring(0, 50)}...`);

    const result = await updatePortfolioItem(item.id, {
      img: heroImageUrl
    });

    if (result) {
      console.log(`   ✅ Updated\n`);
      updated++;
    } else {
      console.log(`   ❌ Failed\n`);
    }
  }

  console.log('=== SUMMARY ===');
  console.log(`✅ Updated: ${updated}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log('\n🎉 Portfolio thumbnails now match project heroes!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
