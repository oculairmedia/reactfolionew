#!/usr/bin/env node

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

async function fixRemainingSubtitles() {
  console.log('=== FIXING REMAINING PROJECT SUBTITLES ===\n');
  
  const subtitleUpdates = [
    {
      id: 'merchant-ale-house',
      subtitle: "Revitalizing a historic pub's visual identity for the modern craft beer enthusiast"
    },
    {
      id: 'garden-city-essentials', 
      subtitle: 'Cultivating a fresh, organic brand for urban gardening essentials'
    }
  ];
  
  try {
    for (const update of subtitleUpdates) {
      const response = await axios.get(`${API_URL}/projects?where[id][equals]=${update.id}`);
      const project = response.data.docs[0];
      
      if (project) {
        console.log(`📝 ${project.title}`);
        console.log(`   New subtitle: "${update.subtitle}"`);
        
        await axios.patch(
          `${API_URL}/projects/${project.id}`,
          { subtitle: update.subtitle },
          { headers: getHeaders() }
        );
        
        console.log(`   ✅ Updated!\n`);
      } else {
        console.log(`❌ Project not found: ${update.id}\n`);
      }
    }
    
    console.log('✅ All project subtitles updated!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🚀 Fixing remaining project subtitles...\n');
  await login();
  await fixRemainingSubtitles();
  console.log('\n🎉 Complete!');
}

main().catch(console.error);
