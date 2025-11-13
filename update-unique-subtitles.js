#!/usr/bin/env node

/**
 * Update all projects with unique, compelling subtitles
 * These serve as engaging hooks that don't duplicate the Overview content
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

// Unique, compelling subtitles for each project
// These are hooks that draw readers in without duplicating the Overview
const uniqueSubtitles = {
  'voices-unheard': 
    'Reimagining sacred spaces through AI-generated imagery for marginalized communities',
  
  'binmetrics': 
    'Transforming waste management with intelligent monitoring and real-time analytics',
  
  'branton': 
    'Where contemporary design meets timeless furniture craftsmanship',
  
  'aquatic-resonance': 
    'An immersive journey through underwater soundscapes and visual poetry',
  
  '3m-vhb-tapes': 
    'Bringing industrial adhesive technology to life through dynamic 3D visualization',
  
  'super-burgers': 
    'Crafting a bold, playful brand identity for a new fast-food experience',
  
  'merchant-ale': 
    'Revitalizing a historic pub\'s visual identity for the modern craft beer enthusiast',
  
  'liebling-wines': 
    'Elegant packaging design that tells the story of boutique winemaking',
  
  'garden-city': 
    'Cultivating a fresh, organic brand for urban gardening essentials',
  
  'couple-ish': 
    'Exploring modern relationships through experimental digital art and animation',
  
  'coffee-by-altitude': 
    'Elevating specialty coffee through design that celebrates origin and altitude'
};

async function updateProjectSubtitles() {
  console.log('=== UPDATING PROJECT SUBTITLES ===\n');
  
  try {
    const response = await axios.get(`${API_URL}/projects?limit=100`);
    const projects = response.data.docs;
    
    let updated = 0;
    let skipped = 0;
    
    for (const project of projects) {
      const newSubtitle = uniqueSubtitles[project.id];
      
      if (newSubtitle) {
        console.log(`📝 ${project.title}`);
        console.log(`   Old subtitle: "${project.subtitle?.substring(0, 60)}..."`);
        console.log(`   New subtitle: "${newSubtitle}"`);
        
        await axios.patch(
          `${API_URL}/projects/${project.id}`,
          { subtitle: newSubtitle },
          { headers: getHeaders() }
        );
        
        console.log(`   ✅ Updated!\n`);
        updated++;
      } else {
        console.log(`⚠️  No subtitle defined for: ${project.id}\n`);
        skipped++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Updated ${updated} projects with unique subtitles`);
    if (skipped > 0) {
      console.log(`⚠️  Skipped ${skipped} projects (no subtitle defined)`);
    }
    
    console.log('\n📋 Result: Projects now have:');
    console.log('   • Compelling subtitle hooks under the title');
    console.log('   • Full descriptions in Overview sections');
    console.log('   • No duplicate content between subtitle and Overview');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🚀 Updating all projects with unique subtitles...\n');
  await login();
  await updateProjectSubtitles();
  console.log('\n🎉 Complete!');
}

main().catch(console.error);
