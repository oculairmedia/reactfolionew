#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CMS_URL = 'http://192.168.50.90:3006';
const PAYLOAD_EMAIL = 'emanuvaderland@gmail.com';
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD;

let authToken = null;

const PROJECT_MAPPINGS = {
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

async function authenticate() {
  const response = await fetch(`${CMS_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: PAYLOAD_EMAIL, password: PAYLOAD_PASSWORD }),
  });
  const data = await response.json();
  authToken = data.token;
  console.log('✅ Authenticated\n');
}

// Better text extraction - strip all JSX/HTML
function cleanText(text) {
  return text
    .replace(/<[^>]+>/g, '') // Remove all tags
    .replace(/\{[^}]+\}/g, '') // Remove {variables}
    .replace(/&[a-z]+;/g, ' ') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Extract sections with improved pattern matching
function extractSections(content) {
  const sections = [];
  
  // Match h3 headings and capture everything until next h3 or Row
  const regex = /<h3[^>]*>([^<]+)<\/h3>([\s\S]*?)(?=(?:<h3|<Row className="sec_sp"|$))/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const title = cleanText(match[1]);
    const sectionContent = match[2];
    
    // Extract all paragraph content
    const paragraphs = [];
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
    let pMatch;
    
    while ((pMatch = pRegex.exec(sectionContent)) !== null) {
      const text = cleanText(pMatch[1]);
      if (text.length > 20) {
        paragraphs.push(text);
      }
    }
    
    if (paragraphs.length > 0 && title.length > 0) {
      sections.push({
        title: title,
        content: paragraphs.join('\n\n'),
        layout: 'two-column'
      });
    }
  }
  
  return sections;
}

// Extract metadata
function extractMetadata(content) {
  const metadata = {};
  
  // Find the metadata section
  const metaSection = content.match(/Project Details[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/);
  if (metaSection) {
    const liRegex = /<li[^>]*>([^:]+):\s*([^<]+)<\/li>/g;
    let match;
    
    while ((match = liRegex.exec(metaSection[1])) !== null) {
      const key = match[1].trim().toLowerCase();
      const value = cleanText(match[2]);
      metadata[key] = value;
    }
  }
  
  return metadata;
}

// Extract projectData object
function extractProjectData(content) {
  const result = {};
  
  const projectDataMatch = content.match(/const projectData = \{([\s\S]*?)\};/);
  if (!projectDataMatch) return result;
  
  const dataStr = projectDataMatch[1];
  
  // Extract fields with multi-line support
  const extractField = (fieldName) => {
    const regex = new RegExp(`${fieldName}:\\s*["'\`]([\s\S]*?)["'\`](?:,|\\n|$)`, 'm');
    const match = dataStr.match(regex);
    return match ? match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').trim() : null;
  };
  
  result.overview = extractField('overview');
  result.process = extractField('process');
  
  // Extract services array
  const servicesMatch = dataStr.match(/services:\s*\[([\s\S]*?)\]/);
  if (servicesMatch) {
    result.services = servicesMatch[1].matchAll(/["']([^"']+)["']/g);
    result.services = Array.from(result.services, m => m[1]);
  }
  
  // Extract testimonial
  const testimonialMatch = dataStr.match(/testimonial:\s*\{([\s\S]*?quote:\s*["']([^"']+)["'][\s\S]*?)\}/);
  if (testimonialMatch) {
    const tStr = testimonialMatch[1];
    const quoteMatch = tStr.match(/quote:\s*["']([^"']+)["']/);
    const authorMatch = tStr.match(/author:\s*["']([^"']+)["']/);
    const companyMatch = tStr.match(/company:\s*["']([^"']+)["']/);
    
    result.testimonial = {
      quote: quoteMatch ? quoteMatch[1] : '',
      author: authorMatch ? authorMatch[1] : '',
      company: companyMatch ? companyMatch[1] : ''
    };
  }
  
  return result;
}

async function updateProject(projectId, data) {
  const response = await fetch(`${CMS_URL}/api/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `JWT ${authToken}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  
  return await response.json();
}

async function migrateProject(filename) {
  const projectId = PROJECT_MAPPINGS[filename];
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📄 ${projectId}`);
  console.log('='.repeat(70));
  
  const filePath = path.join(__dirname, '.temp', 'original-projects', filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract all content
  const sections = extractSections(content);
  const metadata = extractMetadata(content);
  const projectData = extractProjectData(content);
  
  console.log(`   Sections found: ${sections.length}`);
  sections.forEach(s => console.log(`      - ${s.title}`));
  
  // Build update data
  const updateData = {
    sections: sections,
    metadata: {
      date: metadata.date || '',
      client: metadata.client || '',
      role: metadata.role || '',
      exhibition: metadata.exhibition || '',
      curators: metadata.curators || '',
      collaborators: metadata.collaborators || '',
      technologies: metadata.technologies || ''
    }
  };
  
  // Add projectData sections
  if (projectData.overview) {
    console.log(`   + Overview (${projectData.overview.length} chars)`);
    updateData.sections.unshift({
      title: 'Overview',
      content: projectData.overview,
      layout: 'two-column'
    });
  }
  
  if (projectData.process) {
    console.log(`   + Process (${projectData.process.length} chars)`);
    updateData.sections.push({
      title: 'The Process',
      content: projectData.process,
      layout: 'two-column'
    });
  }
  
  // Add subtitle
  if (projectData.overview) {
    const subtitle = projectData.overview.substring(0, 200);
    updateData.subtitle = subtitle.substring(0, subtitle.lastIndexOf(' ')) + '...';
  }
  
  try {
    await updateProject(projectId, updateData);
    console.log(`   ✅ Updated with ${updateData.sections.length} sections`);
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message.substring(0, 100)}`);
  }
  
  await new Promise(r => setTimeout(r, 300));
}

async function main() {
  console.log('🚀 Project Content Migration v2\n');
  
  if (!PAYLOAD_PASSWORD) {
    console.error('❌ PAYLOAD_PASSWORD required');
    process.exit(1);
  }
  
  await authenticate();
  
  for (const file of Object.keys(PROJECT_MAPPINGS)) {
    await migrateProject(file);
  }
  
  console.log('\n✅ Migration complete!\n');
}

main();
