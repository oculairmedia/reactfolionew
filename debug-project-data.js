#!/usr/bin/env node

require('dotenv').config({ path: '.env.payload' });
const axios = require('axios');

const API_BASE = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://192.168.50.90:3006';
const API_URL = `${API_BASE}/api`;

async function debug() {
  const projects = await axios.get(`${API_URL}/projects?limit=100`);
  
  const binmetrics = projects.data.docs.find(p => p.title === 'Binmetrics');
  const aquatic = projects.data.docs.find(p => p.title === 'Aquatic Resonance');

  console.log('Binmetrics data:', JSON.stringify(binmetrics, null, 2));
  console.log('\n\nAquatic Resonance data:', JSON.stringify(aquatic, null, 2));
}

debug().catch(console.error);
