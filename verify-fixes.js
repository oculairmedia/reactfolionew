#!/usr/bin/env node

require('dotenv').config({ path: '.env.payload' });
const axios = require('axios');

const API_BASE = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://192.168.50.90:3006';
const API_URL = `${API_BASE}/api`;

async function verify() {
  console.log('🔍 Verifying fixes...\n');

  // Check projects
  const projects = await axios.get(`${API_URL}/projects?limit=100`);
  
  const binmetrics = projects.data.docs.find(p => p.title === 'Binmetrics');
  const aquatic = projects.data.docs.find(p => p.title === 'Aquatic Resonance');

  console.log('📹 Binmetrics:');
  console.log(`   Hero Type: ${binmetrics.heroType}`);
  console.log(`   Hero Video: ${binmetrics.heroVideo}`);
  console.log(`   Hero Image: ${binmetrics.heroImage ? 'SET (should be null)' : 'null ✅'}`);

  console.log('\n📹 Aquatic Resonance:');
  console.log(`   Hero Type: ${aquatic.heroType}`);
  console.log(`   Hero Video: ${aquatic.heroVideo}`);

  // Check about page
  const about = await axios.get(`${API_URL}/globals/about-page`);
  
  console.log('\n📄 About Page Global:');
  console.log(`   Timeline entries: ${about.data.timeline?.length || 0} (should be 3)`);
  console.log(`   Skills entries: ${about.data.skills?.length || 0} (should be 5)`);
  console.log(`   Services entries: ${about.data.services?.length || 0} (should be 3)`);

  console.log('\n✅ Verification complete!');
}

verify().catch(console.error);
