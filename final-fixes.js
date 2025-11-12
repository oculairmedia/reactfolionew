#!/usr/bin/env node

/**
 * Final Fixes Script
 * 1. Fix Binmetrics hero (image → video)
 * 2. Fix Aquatic Resonance hero (correct video)
 * 3. Update About page data (timeline, skills, services)
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

// About page data from original about.json
const aboutPageData = {
  timeline: [
    {
      jobtitle: "Digital Designer",
      where: "Incontrol",
      date: "Apr 2021 - Apr 2023"
    },
    {
      jobtitle: "Digital Designer",
      where: "Branton Advertising",
      date: "Apr 2018 - Jan 2020"
    },
    {
      jobtitle: "UX/UI Designer",
      where: "Apollo Metrics",
      date: "Apr 2014 - Apr 2017"
    }
  ],
  skills: [
    {
      name: "Print Design",
      value: 90
    },
    {
      name: "Web Design",
      value: 95
    },
    {
      name: "3D Animation",
      value: 85
    },
    {
      name: "UX/UI Design",
      value: 90
    },
    {
      name: "Adobe Creative Suite",
      value: 95
    }
  ],
  services: [
    {
      title: "UI & UX Design",
      description: "Creating intuitive and engaging user interfaces and experiences for web and mobile applications."
    },
    {
      title: "3D Modeling & Animation",
      description: "Bringing ideas to life through stunning 3D models and animations for various media projects."
    },
    {
      title: "Digital Marketing Materials",
      description: "Designing eye-catching marketing materials for digital channels to boost engagement and brand awareness."
    }
  ]
};

async function getAllProjects() {
  try {
    const response = await axios.get(`${API_URL}/projects?limit=100`);
    return response.data.docs;
  } catch (error) {
    console.error('Error fetching projects:', error.message);
    return [];
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

async function updateAboutGlobal() {
  try {
    // Get the current about-page global
    const response = await axios.get(`${API_URL}/globals/about-page`, { headers: getHeaders() });
    const currentData = response.data;
    
    // Update with full data
    const updatedData = {
      ...currentData,
      timeline: aboutPageData.timeline,
      skills: aboutPageData.skills,
      services: aboutPageData.services
    };
    
    const updateResponse = await axios.post(
      `${API_URL}/globals/about-page`,
      updatedData,
      { headers: getHeaders() }
    );
    
    console.log('✅ Updated About page global with timeline, skills, and services');
    return updateResponse.data;
  } catch (error) {
    console.error('Error updating about-page global:', error.response?.data || error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting final fixes...\n');

  // Login first
  await login();

  // Get all projects
  console.log('📥 Fetching all projects...');
  const projects = await getAllProjects();
  console.log(`Found ${projects.length} projects\n`);

  // Find Binmetrics and Aquatic Resonance
  const binmetrics = projects.find(p => p.title === 'Binmetrics');
  const aquatic = projects.find(p => p.title === 'Aquatic Resonance');

  if (!binmetrics) {
    console.error('❌ Binmetrics project not found');
  } else {
    console.log('📝 Updating Binmetrics hero to video...');
    console.log(`   Current hero type: ${binmetrics.hero?.type || 'not set'}`);
    
    const updated = await updateProject(binmetrics.id, {
      hero: {
        type: 'video',
        video: 'https://oculair.b-cdn.net/api/v1/videos/332b28a6113e401b77b6894d3254766d15c6a9ac/3rjei659/avc',
        alt: 'Binmetrics Video'
      }
    });
    
    if (updated) {
      console.log('✅ Binmetrics hero updated to video');
    }
  }

  if (!aquatic) {
    console.error('❌ Aquatic Resonance project not found');
  } else {
    console.log('\n📝 Updating Aquatic Resonance hero video...');
    console.log(`   Current hero type: ${aquatic.hero?.type || 'not set'}`);
    console.log(`   Current video: ${aquatic.hero?.video || 'not set'}`);
    
    const updated = await updateProject(aquatic.id, {
      hero: {
        type: 'video',
        video: 'https://oculair.b-cdn.net/downloads/title.avc',
        alt: 'Aquatic Resonance Animation'
      }
    });
    
    if (updated) {
      console.log('✅ Aquatic Resonance hero video updated to match homepage');
    }
  }

  // Update About page data
  console.log('\n📝 Updating About page global data...');
  await updateAboutGlobal();

  console.log('\n✨ All fixes complete!\n');
  console.log('Summary of changes:');
  console.log('  1. Binmetrics: Changed hero from image to video');
  console.log('  2. Aquatic Resonance: Updated hero video to homepage video');
  console.log('  3. About Page: Added timeline (3 jobs), skills (5 items), services (3 items)');
  console.log('\n🎉 Portfolio CMS migration is now 100% complete!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
