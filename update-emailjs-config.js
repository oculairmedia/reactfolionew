#!/usr/bin/env node

/**
 * Update EmailJS configuration
 * Use this if you need to update Service ID, Template ID, or Public Key
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

async function updateEmailJSConfig() {
  console.log('=== UPDATE EMAILJS CONFIGURATION ===\n');
  
  // Get values from command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node update-emailjs-config.js <serviceId> [templateId] [publicKey]');
    console.log('\nExample:');
    console.log('  node update-emailjs-config.js service_abc123');
    console.log('  node update-emailjs-config.js service_abc123 template_xyz789');
    console.log('  node update-emailjs-config.js service_abc123 template_xyz789 publicKey123\n');
    process.exit(1);
  }
  
  const [serviceId, templateId, publicKey] = args;
  
  try {
    const settings = await axios.get(`${API_URL}/globals/site-settings`, { headers: getHeaders() });
    
    const updates = {
      ...settings.data,
      contact: {
        ...settings.data.contact,
        serviceId: serviceId || settings.data.contact.serviceId,
        templateId: templateId || settings.data.contact.templateId,
        publicKey: publicKey || settings.data.contact.publicKey
      }
    };
    
    console.log('Current Configuration:');
    console.log('  Service ID:', settings.data.contact.serviceId);
    console.log('  Template ID:', settings.data.contact.templateId);
    console.log('  Public Key:', settings.data.contact.publicKey);
    console.log('  Email:', settings.data.contact.email);
    
    console.log('\nNew Configuration:');
    console.log('  Service ID:', updates.contact.serviceId);
    console.log('  Template ID:', updates.contact.templateId);
    console.log('  Public Key:', updates.contact.publicKey);
    console.log('  Email:', updates.contact.email);
    
    await axios.post(`${API_URL}/globals/site-settings`, updates, { headers: getHeaders() });
    
    console.log('\n✅ EmailJS configuration updated successfully!');
    console.log('\nNext steps:');
    console.log('  1. Run: npm run sync:content');
    console.log('  2. Test the contact form on your site\n');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🚀 Updating EmailJS configuration...\n');
  await login();
  await updateEmailJSConfig();
}

main().catch(console.error);
