#!/usr/bin/env node

/**
 * Remove duplicate Overview sections from all projects
 * The subtitle already serves as the hook/intro under the title
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

async function removeOverviewSections() {
  console.log('=== REMOVING DUPLICATE OVERVIEW SECTIONS ===\n');
  
  try {
    const response = await axios.get(`${API_URL}/projects?limit=100`);
    const projects = response.data.docs;
    
    let updated = 0;
    
    for (const project of projects) {
      // Check if project has Overview section
      const hasOverview = project.sections?.find(s => s.title === 'Overview');
      
      if (hasOverview) {
        console.log(`Removing Overview from: ${project.title}`);
        
        // Filter out Overview section
        const newSections = project.sections.filter(s => s.title !== 'Overview');
        
        await axios.patch(
          `${API_URL}/projects/${project.id}`,
          { sections: newSections },
          { headers: getHeaders() }
        );
        
        console.log(`  ✅ Removed (${newSections.length} sections remaining)\n`);
        updated++;
      } else {
        console.log(`✓ ${project.title} - No Overview section\n`);
      }
    }
    
    console.log(`\n✅ Updated ${updated} projects`);
    console.log('\nNow project pages will show:');
    console.log('  1. Title');
    console.log('  2. Subtitle (hook line)');
    console.log('  3. Process/Outcome/etc sections');
    console.log('  4. Gallery');
    console.log('  5. Project Details\n');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🚀 Removing duplicate Overview sections...\n');
  await login();
  await removeOverviewSections();
  console.log('🎉 Complete!');
}

main().catch(console.error);
