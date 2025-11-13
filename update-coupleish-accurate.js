#!/usr/bin/env node

/**
 * Update Couple-ish project with accurate information
 * Emmanuel was the unit still photographer and created marketing materials
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

async function updateCoupleish() {
  console.log('=== UPDATING COUPLE-ISH PROJECT ===\n');
  
  try {
    // Get current project
    const response = await axios.get(`${API_URL}/projects?where[id][equals]=couple-ish&limit=1`);
    const project = response.data.docs[0];
    
    if (project) {
      console.log('Found project:', project.title);
      console.log('Current subtitle:', project.subtitle);
      
      // Update with accurate information
      const updates = {
        subtitle: 'Unit still photography and marketing design for Canadian LGBTQ+ web series',
        metadata: {
          client: 'Couple-ish Production',
          date: '2015-2017', // When the series ran
          role: 'Unit Still Photographer, Marketing Designer',
          technologies: 'Photography, Photoshop, Illustrator, Print Design'
        }
      };
      
      // Also update the Overview section if it exists
      const sections = project.sections || [];
      const overviewIndex = sections.findIndex(s => s.title === 'Overview');
      
      if (overviewIndex !== -1) {
        sections[overviewIndex].content = `Couple-ish is a Canadian LGBTQ+ web series created by K Alexander, featuring a non-binary illustrator and their British roommate navigating a fake relationship. As the principal unit still photographer and marketing designer, I captured behind-the-scenes moments, created promotional stills, and designed all marketing materials including posters and social media assets for both seasons of this groundbreaking series.`;
        updates.sections = sections;
      }
      
      console.log('\nUpdating with:');
      console.log('New subtitle:', updates.subtitle);
      console.log('Client:', updates.metadata.client);
      console.log('Date:', updates.metadata.date);
      console.log('Role:', updates.metadata.role);
      console.log('Technologies:', updates.metadata.technologies);
      
      await axios.patch(
        `${API_URL}/projects/${project.id}`,
        updates,
        { headers: getHeaders() }
      );
      
      console.log('\n✅ Successfully updated Couple-ish project!');
    } else {
      console.log('❌ Project not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🚀 Updating Couple-ish with accurate information...\n');
  await login();
  await updateCoupleish();
  console.log('\n🎉 Complete!');
}

main().catch(console.error);
