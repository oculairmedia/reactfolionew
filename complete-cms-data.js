#!/usr/bin/env node

/**
 * Complete CMS Data - Fill in all missing fields
 */

require('dotenv').config({ path: '.env.payload' });
const axios = require('axios');
const fs = require('fs');
const path = require('path');

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

// Project metadata extracted from original files
const projectMetadata = {
  'voices-unheard': {
    client: 'Inter/Access',
    date: 'November 2023',
    role: 'Digital Artist, Video Creator',
    technologies: 'AI Image Generation, Video Editing, After Effects'
  },
  'binmetrics': {
    client: 'Bin Metrics',
    date: 'February 2024',
    role: 'UX/UI Designer, Brand Identity Designer',
    technologies: 'Web Design, Mobile App Design, 3D Prototyping'
  },
  'branton': {
    client: 'Branton',
    date: 'January 2021',
    role: 'Digital Designer, 3D Artist',
    technologies: 'Houdini, Adobe Creative Suite'
  },
  'aquatic-resonance': {
    client: 'Arnie Guha (Collaboration)',
    date: 'March 2024',
    role: 'Digital Animator, Creative Director',
    technologies: 'Adobe After Effects, Custom JavaScript'
  },
  '3m-vhb-tapes': {
    client: '3M',
    date: 'September 2023',
    role: 'Motion Designer, 3D Artist',
    technologies: 'Cinema 4D, After Effects, Redshift'
  },
  'super-burgers': {
    client: 'Super Burgers & Fries',
    date: 'June 2023',
    role: 'Brand Designer, Web Designer',
    technologies: 'Figma, Webflow, Illustrator'
  },
  'merchant-ale': {
    client: 'The Merchant Ale House',
    date: 'August 2023',
    role: 'Brand Designer, Print Designer',
    technologies: 'Illustrator, Photoshop, InDesign'
  },
  'liebling-wines': {
    client: 'Liebling Wines',
    date: 'May 2023',
    role: 'Brand Designer, Packaging Designer',
    technologies: 'Illustrator, Photoshop'
  },
  'garden-city': {
    client: 'Garden City Essentials',
    date: 'July 2023',
    role: 'Brand Designer, Web Designer',
    technologies: 'Figma, Illustrator, Shopify'
  },
  'couple-ish': {
    client: 'Personal Project',
    date: 'April 2024',
    role: 'Digital Artist, Animator',
    technologies: 'Blender, After Effects, Substance Painter'
  },
  'coffee-by-altitude': {
    client: 'Coffee by Altitude',
    date: 'October 2023',
    role: 'Brand Designer, Web Designer',
    technologies: 'Figma, Illustrator, WordPress'
  }
};

async function updateSiteSettings() {
  console.log('=== UPDATING SITE SETTINGS ===\n');
  
  try {
    const current = await axios.get(`${API_URL}/globals/site-settings`, { headers: getHeaders() });
    
    const updated = {
      ...current.data,
      contact: {
        ...current.data.contact,
        serviceId: 'service_2fil88f',
        templateId: 'template_ksmke1h',
        publicKey: 'h9e4_z0Y1zbBb54me'
      }
    };
    
    await axios.post(`${API_URL}/globals/site-settings`, updated, { headers: getHeaders() });
    console.log('✅ Updated EmailJS config in site settings\n');
  } catch (error) {
    console.error('❌ Failed to update site settings:', error.message);
  }
}

async function updateProjects() {
  console.log('=== UPDATING PROJECT METADATA ===\n');
  
  try {
    const response = await axios.get(`${API_URL}/projects?limit=100`);
    const projects = response.data.docs;
    
    let updated = 0;
    
    for (const project of projects) {
      const metadata = projectMetadata[project.id];
      
      if (metadata) {
        console.log(`Updating ${project.title}...`);
        
        await axios.patch(
          `${API_URL}/projects/${project.id}`,
          {
            metadata: {
              client: metadata.client,
              date: metadata.date,
              role: metadata.role,
              technologies: metadata.technologies
            }
          },
          { headers: getHeaders() }
        );
        
        console.log(`  ✅ Added: ${metadata.client} | ${metadata.date} | ${metadata.role}`);
        updated++;
      }
    }
    
    console.log(`\n✅ Updated ${updated} projects\n`);
  } catch (error) {
    console.error('❌ Failed to update projects:', error.message);
  }
}

async function main() {
  console.log('🚀 Completing CMS data...\n');
  
  await login();
  await updateSiteSettings();
  await updateProjects();
  
  console.log('🎉 All CMS data complete!');
}

main().catch(console.error);
