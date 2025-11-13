#!/usr/bin/env node
require('dotenv').config({ path: '.env.payload' });
const axios = require('axios');

const API_BASE = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://192.168.50.90:3006';
const API_URL = `${API_BASE}/api`;

async function checkProject() {
  try {
    const response = await axios.get(`${API_URL}/projects?where[id][equals]=voices-unheard&limit=1`);
    const project = response.data.docs[0];
    
    console.log('=== PROJECT STRUCTURE ===\n');
    console.log('Title:', project.title);
    console.log('\nSubtitle:', project.subtitle);
    console.log('\nSubtitle length:', project.subtitle?.length || 0);
    console.log('\nSections:');
    project.sections?.forEach((section, i) => {
      console.log(`\n${i + 1}. ${section.title}`);
      console.log(`   Content length: ${section.content?.length || 0} chars`);
      console.log(`   First 150 chars: ${section.content?.substring(0, 150)}...`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkProject();
