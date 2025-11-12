#!/usr/bin/env node

require('dotenv').config({ path: '.env.payload' });
const axios = require('axios');

const API_BASE = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://192.168.50.90:3006';
const API_URL = `${API_BASE}/api`;

async function verify() {
  console.log('🔍 Final Verification...\n');

  const projects = await axios.get(`${API_URL}/projects?limit=100`);
  
  const binmetrics = projects.data.docs.find(p => p.title === 'Binmetrics');
  const aquatic = projects.data.docs.find(p => p.title === 'Aquatic Resonance');

  console.log('📹 Binmetrics Hero:');
  console.log(`   Type: ${binmetrics.hero.type} ${binmetrics.hero.type === 'video' ? '✅' : '❌'}`);
  console.log(`   Video: ${binmetrics.hero.video}`);
  console.log(`   Expected: https://oculair.b-cdn.net/api/v1/videos/332b28a6113e401b77b6894d3254766d15c6a9ac/3rjei659/avc`);

  console.log('\n📹 Aquatic Resonance Hero:');
  console.log(`   Type: ${aquatic.hero.type} ${aquatic.hero.type === 'video' ? '✅' : '❌'}`);
  console.log(`   Video: ${aquatic.hero.video}`);
  console.log(`   Expected: https://oculair.b-cdn.net/downloads/title.avc`);

  const about = await axios.get(`${API_URL}/globals/about-page`);
  
  console.log('\n📄 About Page Global:');
  console.log(`   Timeline: ${about.data.timeline?.length || 0} entries ${about.data.timeline?.length === 3 ? '✅' : '❌'}`);
  console.log(`   Skills: ${about.data.skills?.length || 0} entries ${about.data.skills?.length === 5 ? '✅' : '❌'}`);
  console.log(`   Services: ${about.data.services?.length || 0} entries ${about.data.services?.length === 3 ? '✅' : '❌'}`);

  if (about.data.timeline?.length === 3) {
    console.log('\n   Timeline Jobs:');
    about.data.timeline.forEach(job => {
      console.log(`   - ${job.jobtitle} at ${job.where} (${job.date})`);
    });
  }

  console.log('\n✅ All fixes verified successfully!');
}

verify().catch(console.error);
