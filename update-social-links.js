#!/usr/bin/env node

/**
 * Update Social Links in CMS
 */

require('dotenv').config({ path: '.env.payload' });
const axios = require('axios');

const API_BASE = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://192.168.50.90:3006';
const API_URL = `${API_BASE}/api`;

let authToken = null;

async function login() {
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email: process.env.PAYLOAD_EMAIL,
      password: process.env.PAYLOAD_PASSWORD
    });
    authToken = response.data.token;
    console.log('✅ Authenticated successfully\n');
    return authToken;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `JWT ${authToken}`
  };
}

async function updateSiteSettings() {
  try {
    // Get current settings
    const current = await axios.get(`${API_URL}/globals/site-settings`, { headers: getHeaders() });
    
    console.log('Current social links:');
    console.log(JSON.stringify(current.data.social, null, 2));
    
    // Update with complete social links
    const updated = {
      ...current.data,
      social: {
        github: 'https://github.com/oculairmedia',
        facebook: 'https://www.facebook.com/emmanuel.umukoro',
        linkedin: 'https://www.linkedin.com/in/emmanuel-umukoro-50b45597',
        twitter: 'https://x.com/emanuvaderland'
      }
    };
    
    const response = await axios.post(
      `${API_URL}/globals/site-settings`,
      updated,
      { headers: getHeaders() }
    );
    
    console.log('\n✅ Updated social links:');
    console.log(JSON.stringify(response.data.social, null, 2));
    
  } catch (error) {
    console.error('❌ Error updating site settings:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🚀 Updating social links in CMS...\n');
  await login();
  await updateSiteSettings();
  console.log('\n🎉 Done!');
}

main().catch(console.error);
