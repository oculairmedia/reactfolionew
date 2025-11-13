#!/usr/bin/env node

/**
 * Fix subtitle truncation and remove duplicate Overview
 * 1. Copy full Overview content to subtitle
 * 2. Remove Overview section
 */

require('dotenv').config({ path: '.env.payload' });
const axios = require('axios');

const API_BASE = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://192.168.50.90:3006';
const API_URL = `${API_BASE}/api`;

let authToken = null;

async function login() {
  const response = await axios.post(`${API_URL}/users/login`, {
    email: process.env.PAYLOAD_EMAIL,
    password: process.env.PAYLOAD_PASSWORD
  });
  authToken = response.data.token;
  console.log('✅ Authenticated\n');
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `JWT ${authToken}`
  };
}

async function fixSubtitlesAndOverviews() {
  console.log('=== FIXING SUBTITLES AND REMOVING OVERVIEW SECTIONS ===\n');
  
  try {
    const response = await axios.get(`${API_URL}/projects?limit=100`);
    const projects = response.data.docs;
    
    let updated = 0;
    
    for (const project of projects) {
      const overviewSection = project.sections?.find(s => s.title === 'Overview');
      
      if (overviewSection) {
        console.log(`Processing: ${project.title}`);
        console.log(`  Current subtitle length: ${project.subtitle?.length || 0} chars`);
        console.log(`  Overview content length: ${overviewSection.content?.length || 0} chars`);
        
        // Copy Overview content to subtitle (full text)
        const updates = {
          subtitle: overviewSection.content,
          sections: project.sections.filter(s => s.title !== 'Overview')
        };
        
        await axios.patch(
          `${API_URL}/projects/${project.id}`,
          updates,
          { headers: getHeaders() }
        );
        
        console.log(`  ✅ Updated subtitle to full text, removed Overview section`);
        console.log(`  Remaining sections: ${updates.sections.map(s => s.title).join(', ')}\n`);
        updated++;
      } else {
        console.log(`✓ ${project.title} - No Overview section\n`);
      }
    }
    
    console.log(`\n✅ Updated ${updated} projects`);
    console.log('\nProject pages now show:');
    console.log('  1. Title');
    console.log('  2. Full subtitle (complete description)');
    console.log('  3. Process/Outcome sections');
    console.log('  4. Gallery');
    console.log('  5. Project Details\n');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🚀 Fixing subtitles and removing Overview sections...\n');
  await login();
  await fixSubtitlesAndOverviews();
  console.log('🎉 Complete!');
}

main().catch(console.error);
