#!/usr/bin/env node
require('dotenv').config({ path: '.env.payload' });
const axios = require('axios');

const API_BASE = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://192.168.50.90:3006';
const API_URL = `${API_BASE}/api`;

async function checkCoupleish() {
  try {
    const response = await axios.get(`${API_URL}/projects?where[id][equals]=couple-ish&limit=1`);
    const project = response.data.docs[0];
    
    if (project) {
      console.log('Title:', project.title);
      console.log('\nCurrent Subtitle:', project.subtitle);
      console.log('\nOverview Section:');
      const overview = project.sections?.find(s => s.title === 'Overview');
      if (overview) {
        console.log(overview.content);
      }
      console.log('\nMetadata:');
      console.log('- Client:', project.metadata?.client);
      console.log('- Date:', project.metadata?.date);
      console.log('- Role:', project.metadata?.role);
      console.log('- Technologies:', project.metadata?.technologies);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCoupleish();
