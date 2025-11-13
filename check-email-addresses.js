#!/usr/bin/env node
require('dotenv').config({ path: '.env.payload' });
const axios = require('axios');

const API_BASE = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://192.168.50.90:3006';
const API_URL = `${API_BASE}/api`;

async function checkEmails() {
  try {
    console.log('=== CHECKING EMAIL ADDRESSES ===\n');
    
    // Check site settings
    const settings = await axios.get(`${API_URL}/globals/site-settings`);
    console.log('SITE SETTINGS:');
    console.log('Email:', settings.data.contact?.email);
    console.log('EmailJS Service ID:', settings.data.contact?.serviceId);
    console.log('EmailJS Template ID:', settings.data.contact?.templateId);
    console.log('EmailJS Public Key:', settings.data.contact?.publicKey);
    
    // Check home intro
    const home = await axios.get(`${API_URL}/globals/home-intro`);
    if (home.data.email) {
      console.log('\nHOME INTRO:');
      console.log('Email:', home.data.email);
    }
    
    // Check about page
    const about = await axios.get(`${API_URL}/globals/about-page`);
    if (about.data.email) {
      console.log('\nABOUT PAGE:');
      console.log('Email:', about.data.email);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkEmails();
