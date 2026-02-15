#!/usr/bin/env node

/**
 * Populate New Globals Script
 * 
 * Creates/updates the 5 new globals in Payload CMS:
 * - Navigation
 * - Footer
 * - Portfolio Page
 * - Contact Page
 * - UI Text
 * 
 * Uses data from src/content/ JSON files
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CMS_API_URL = process.env.CMS_API_URL || 'http://localhost:3006/api';
const EMAIL = 'emanuvaderland@gmail.com';
const PASSWORD = '7beEXKPk93xSD6m';

let authToken = null;

// HTTP request helper
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const lib = isHttps ? https : require('http');
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };
    
    const req = lib.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Login and get auth token
async function login() {
  console.log('[Auth] Logging in to CMS...');
  const response = await request(`${CMS_API_URL}/users/login`, {
    method: 'POST',
    body: { email: EMAIL, password: PASSWORD },
  });
  
  authToken = response.token;
  console.log('[Auth] ✅ Logged in successfully');
  return authToken;
}

// Update or create a global
async function updateGlobal(slug, data) {
  console.log(`\n[Global] Updating ${slug}...`);
  
  try {
    const response = await request(`${CMS_API_URL}/globals/${slug}`, {
      method: 'POST',
      headers: {
        'Authorization': `JWT ${authToken}`,
      },
      body: data,
    });
    
    console.log(`[Global] ✅ Updated ${slug}`);
    return response;
  } catch (error) {
    console.error(`[Global] ❌ Failed to update ${slug}: ${error.message}`);
    throw error;
  }
}

// Main function
async function main() {
  console.log('='.repeat(60));
  console.log('Populate New Globals');
  console.log('='.repeat(60));
  console.log('');
  
  // Login
  await login();
  
  // 1. Navigation
  console.log('\n📍 Creating Navigation global...');
  const navigationData = {
    items: [
      { label: 'Home', path: '/', external: false, order: 1 },
      { label: 'Portfolio', path: '/portfolio', external: false, order: 2 },
      { label: 'About', path: '/about', external: false, order: 3 },
      { label: 'Contact', path: '/contact', external: false, order: 4 },
      { label: 'Blog', path: '/blog', external: false, order: 5 },
    ],
  };
  await updateGlobal('navigation', navigationData);
  
  // 2. Footer
  console.log('\n📄 Creating Footer global...');
  const footerData = {
    copyright: '© 2024 Emmanuel Umukoro. All rights reserved.',
    note: 'Crafted with passion and precision.',
    links: [],
  };
  await updateGlobal('footer', footerData);
  
  // 3. Portfolio Page
  console.log('\n🎨 Creating Portfolio Page global...');
  const portfolioPageData = {
    title: 'Portfolio',
    description: 'Explore my creative work and projects',
    meta_title: 'Portfolio - Emmanuel Umukoro',
    meta_description: 'Explore my creative work and projects',
  };
  await updateGlobal('portfolio-page', portfolioPageData);
  
  // 4. Contact Page
  console.log('\n📧 Creating Contact Page global...');
  const contactPageData = {
    title: 'Contact Me',
    sectionTitle: 'Get in touch',
    submitButton: 'Send',
    sendingText: 'Sending...',
    successMessage: 'SUCCESS! Thank you for your message',
    errorMessage: 'Failed to send message. Please try again.',
    meta_title: 'Contact - Emmanuel Umukoro',
    meta_description: 'Get in touch with Emmanuel Umukoro',
  };
  await updateGlobal('contact-page', contactPageData);
  
  // 5. UI Text
  console.log('\n💬 Creating UI Text global...');
  const uiTextData = {
    viewAllProjects: 'View All Projects',
    returnToPortfolio: 'Return to Portfolio',
    featuredProjects: 'Featured Projects',
    myPortfolio: 'My Portfolio',
    contactMe: 'Contact Me',
  };
  await updateGlobal('ui-text', uiTextData);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All globals created successfully!');
  console.log('='.repeat(60));
  console.log('\nVerify at:');
  console.log(`  - ${CMS_API_URL}/globals/navigation`);
  console.log(`  - ${CMS_API_URL}/globals/footer`);
  console.log(`  - ${CMS_API_URL}/globals/portfolio-page`);
  console.log(`  - ${CMS_API_URL}/globals/contact-page`);
  console.log(`  - ${CMS_API_URL}/globals/ui-text`);
  console.log('\nNow run: npm run sync:content');
}

// Run
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
