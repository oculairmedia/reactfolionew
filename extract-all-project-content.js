#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PROJECT_FILES = {
  'VoicesUnheard.js': 'voices-unheard',
  'CoffeeByAltitude.js': 'coffee-by-altitude',
  'SuperBurgersFries.js': 'super-burgers',
  'MerchantAleHouse.js': 'merchant-ale-house',
  'LieblingWines.js': 'liebling-wines',
  'GardenCityEssentials.js': 'garden-city-essentials',
  'CoupleIsh.js': 'couple-ish',
  'Branton.js': 'branton',
  'Binmetrics.js': 'binmetrics',
  'AquaticResonance.js': 'aquatic-resonance',
  '3MVHBTapes.js': '3m-vhb-tapes'
};

function extractProjectData(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract the projectData object
  const match = content.match(/const projectData = (\{[\s\S]*?\n  \});/);
  if (!match) {
    return null;
  }
  
  let dataStr = match[1];
  
  // Replace image imports with placeholder URLs
  dataStr = dataStr.replace(/heroImage/g, '"HERO_IMAGE"');
  dataStr = dataStr.replace(/\[image\d+(?:,\s*image\d+)*\]/g, '[]');
  
  // Create a safe evaluation context
  try {
    const result = eval('(' + dataStr + ')');
    return result;
  } catch (e) {
    console.error(`Failed to parse ${filePath}:`, e.message);
    return null;
  }
}

// Extract all content
const allProjectContent = {};

for (const [filename, projectId] of Object.entries(PROJECT_FILES)) {
  const filePath = path.join(__dirname, '.temp', 'original-projects', filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${filename} not found`);
    continue;
  }
  
  console.log(`📄 Extracting ${projectId}...`);
  
  const projectData = extractProjectData(filePath);
  
  if (projectData) {
    console.log(`   ✅ Title: ${projectData.title}`);
    console.log(`   - Overview: ${projectData.overview ? 'Yes' : 'No'}`);
    console.log(`   - Process: ${projectData.process ? 'Yes' : 'No'}`);
    console.log(`   - Services: ${projectData.services ? projectData.services.length : 0}`);
    console.log(`   - Testimonial: ${projectData.testimonial ? 'Yes' : 'No'}`);
    
    allProjectContent[projectId] = projectData;
  } else {
    console.log(`   ❌ Could not extract data`);
  }
}

// Save to file
const outputPath = path.join(__dirname, 'extracted-project-content.json');
fs.writeFileSync(outputPath, JSON.stringify(allProjectContent, null, 2));

console.log(`\n✅ Extracted ${Object.keys(allProjectContent).length} projects`);
console.log(`📁 Saved to: ${outputPath}`);

