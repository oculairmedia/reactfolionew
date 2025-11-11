#!/usr/bin/env node
/**
 * Migrate static JSON globals data to Payload CMS
 * 
 * This script migrates:
 * - site-settings global (from src/content/settings/site-settings.json)
 * - home-intro global (from src/content/intro/home.json)
 * - about-page global (from src/content/about/about.json)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CMS_API_URL = process.env.CMS_API_URL || 'https://cms2.emmanuelu.com/api';
const ADMIN_EMAIL = process.env.CMS_ADMIN_EMAIL || 'emanuvaderland@gmail.com';
const ADMIN_PASSWORD = process.env.CMS_ADMIN_PASSWORD || '7beEXKPk93xSD6m';

let authToken = null;

// Authenticate with Payload CMS
async function authenticate() {
  console.log('🔐 Authenticating with Payload CMS...');
  
  const response = await fetch(`${CMS_API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.statusText}`);
  }

  const data = await response.json();
  authToken = data.token;
  console.log('✅ Authenticated successfully');
  return authToken;
}

// Update a global in Payload CMS
async function updateGlobal(slug, data) {
  console.log(`\n📝 Updating global: ${slug}`);
  
  const response = await fetch(`${CMS_API_URL}/globals/${slug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `JWT ${authToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update ${slug}: ${response.statusText}\n${errorText}`);
  }

  const result = await response.json();
  console.log(`✅ Updated ${slug} successfully`);
  return result;
}

// Main migration function
async function migrateGlobals() {
  try {
    console.log('🚀 Starting globals migration to Payload CMS\n');
    
    // Authenticate
    await authenticate();

    // 1. Migrate site-settings
    console.log('\n--- MIGRATING SITE SETTINGS ---');
    const siteSettingsPath = path.join(__dirname, 'src/content/settings/site-settings.json');
    const siteSettings = JSON.parse(fs.readFileSync(siteSettingsPath, 'utf8'));
    
    await updateGlobal('site-settings', {
      logotext: siteSettings.logotext,
      meta: siteSettings.meta,
      contact: siteSettings.contact,
      social: siteSettings.social,
    });

    // 2. Migrate home-intro
    console.log('\n--- MIGRATING HOME INTRO ---');
    const homeIntroPath = path.join(__dirname, 'src/content/intro/home.json');
    const homeIntro = JSON.parse(fs.readFileSync(homeIntroPath, 'utf8'));
    
    await updateGlobal('home-intro', {
      title: homeIntro.title,
      description: homeIntro.description,
      image_url: homeIntro.image_url,
      animated: homeIntro.animated,
    });

    // 3. Migrate about-page
    console.log('\n--- MIGRATING ABOUT PAGE ---');
    const aboutPagePath = path.join(__dirname, 'src/content/about/about.json');
    const aboutPage = JSON.parse(fs.readFileSync(aboutPagePath, 'utf8'));
    
    await updateGlobal('about-page', {
      title: aboutPage.title,
      aboutme: aboutPage.aboutme,
      timeline: aboutPage.timeline,
      skills: aboutPage.skills,
      services: aboutPage.services,
    });

    console.log('\n\n🎉 Migration completed successfully!');
    console.log('\nMigrated globals:');
    console.log('  ✅ site-settings (logotext, meta, contact, social)');
    console.log('  ✅ home-intro (title, description, image_url, animated phrases)');
    console.log('  ✅ about-page (title, aboutme, timeline, skills, services)');
    console.log('\nVerify at:');
    console.log(`  - ${CMS_API_URL}/globals/site-settings`);
    console.log(`  - ${CMS_API_URL}/globals/home-intro`);
    console.log(`  - ${CMS_API_URL}/globals/about-page`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrateGlobals();
