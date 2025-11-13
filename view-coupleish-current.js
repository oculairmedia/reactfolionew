#!/usr/bin/env node
require('dotenv').config({ path: '.env.payload' });
const axios = require('axios');

const API_BASE = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://192.168.50.90:3006';
const API_URL = `${API_BASE}/api`;

async function viewProject() {
  try {
    const response = await axios.get(`${API_URL}/projects?where[id][equals]=couple-ish&limit=1`);
    const project = response.data.docs[0];
    
    if (project) {
      console.log('=== CURRENT COUPLE-ISH LAYOUT ===\n');
      console.log('Title:', project.title);
      console.log('Subtitle:', project.subtitle);
      
      console.log('\n=== SECTIONS ===');
      if (project.sections && project.sections.length > 0) {
        project.sections.forEach((section, i) => {
          console.log(`\n${i + 1}. ${section.title} (${section.layout || 'default layout'})`);
          console.log('   Content preview:', section.content?.substring(0, 100) + '...');
        });
      }
      
      console.log('\n=== GALLERY ===');
      if (project.gallery && project.gallery.length > 0) {
        console.log(`${project.gallery.length} gallery items`);
      }
      
      console.log('\n=== METADATA ===');
      console.log('Client:', project.metadata?.client);
      console.log('Date:', project.metadata?.date);
      console.log('Role:', project.metadata?.role);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

viewProject();
