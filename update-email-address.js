#!/usr/bin/env node

/**
 * Update email address to me@emmanuelu.com everywhere
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

async function updateEmailAddresses() {
  console.log('=== UPDATING EMAIL ADDRESSES TO me@emmanuelu.com ===\n');
  
  try {
    // Update site settings
    console.log('Updating site settings...');
    const settings = await axios.get(`${API_URL}/globals/site-settings`, { headers: getHeaders() });
    
    const updatedSettings = {
      ...settings.data,
      contact: {
        ...settings.data.contact,
        email: 'me@emmanuelu.com'
      }
    };
    
    await axios.post(`${API_URL}/globals/site-settings`, updatedSettings, { headers: getHeaders() });
    console.log('✅ Updated email in site settings');
    
    // Check and update home intro if it has email
    console.log('\nChecking home intro...');
    try {
      const home = await axios.get(`${API_URL}/globals/home-intro`, { headers: getHeaders() });
      if (home.data.email && home.data.email !== 'me@emmanuelu.com') {
        const updatedHome = {
          ...home.data,
          email: 'me@emmanuelu.com'
        };
        await axios.post(`${API_URL}/globals/home-intro`, updatedHome, { headers: getHeaders() });
        console.log('✅ Updated email in home intro');
      } else {
        console.log('✓ Home intro email already correct or not set');
      }
    } catch (e) {
      console.log('✓ Home intro does not have email field');
    }
    
    // Check and update about page if it has email
    console.log('\nChecking about page...');
    try {
      const about = await axios.get(`${API_URL}/globals/about-page`, { headers: getHeaders() });
      if (about.data.email && about.data.email !== 'me@emmanuelu.com') {
        const updatedAbout = {
          ...about.data,
          email: 'me@emmanuelu.com'
        };
        await axios.post(`${API_URL}/globals/about-page`, updatedAbout, { headers: getHeaders() });
        console.log('✅ Updated email in about page');
      } else {
        console.log('✓ About page email already correct or not set');
      }
    } catch (e) {
      console.log('✓ About page does not have email field');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All email addresses updated to me@emmanuelu.com');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🚀 Updating email addresses across the site...\n');
  await login();
  await updateEmailAddresses();
  console.log('\n🎉 Complete!');
}

main().catch(console.error);
