#!/usr/bin/env node

/**
 * Project Content Migration Script
 * 
 * Extracts content from original JSX files and migrates to Payload CMS
 * - Parses JSX to extract text content, metadata, images
 * - Downloads images from CDN
 * - Uploads images to Payload
 * - Updates projects with proper structure
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const FormData = require('form-data');

const CMS_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://192.168.50.90:3006';
const PAYLOAD_EMAIL = process.env.PAYLOAD_EMAIL || 'emanuvaderland@gmail.com';
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD;

let authToken = null;

// Project ID mappings
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

// Authenticate
async function authenticate() {
  const response = await fetch(`${CMS_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: PAYLOAD_EMAIL,
      password: PAYLOAD_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.status}`);
  }

  const data = await response.json();
  authToken = data.token;
  console.log('✅ Authenticated\n');
}

// Download file from URL
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

// Upload media to Payload
async function uploadMedia(buffer, filename, alt = '') {
  const form = new FormData();
  form.append('file', buffer, filename);
  if (alt) form.append('alt', alt);

  const response = await fetch(`${CMS_URL}/api/media`, {
    method: 'POST',
    headers: {
      'Authorization': `JWT ${authToken}`,
      ...form.getHeaders()
    },
    body: form
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${error}`);
  }

  return await response.json();
}

// Extract image URLs from JSX content
function extractImageUrls(content) {
  const urls = [];
  
  // Match src="..." patterns
  const srcMatches = content.matchAll(/src=["']([^"']+)["']/g);
  for (const match of srcMatches) {
    const url = match[1];
    if (url.includes('oculair.b-cdn.net') || url.includes('http')) {
      urls.push(url);
    }
  }
  
  return [...new Set(urls)]; // Remove duplicates
}

// Extract video URLs
function extractVideoUrls(content) {
  const urls = [];
  const srcMatches = content.matchAll(/<source[^>]+src=["']([^"']+)["']/g);
  
  for (const match of srcMatches) {
    const url = match[1];
    if (url.includes('video') || url.includes('.mp4') || url.includes('.avc') || url.includes('.hevc')) {
      urls.push(url);
    }
  }
  
  return [...new Set(urls)];
}

// Extract text content from JSX
function extractTextContent(content, projectId) {
  const result = {
    title: '',
    subtitle: '',
    sections: [],
    metadata: {},
    heroType: 'image',
    heroVideo: null
  };
  
  // Extract title
  const titleMatch = content.match(/<h1[^>]*>([^<]+)</);
  if (titleMatch) {
    result.title = titleMatch[1].trim();
  }
  
  // Extract sections (h3 headings with following paragraphs)
  const sectionMatches = content.matchAll(/<h3[^>]*>([^<]+)<\/h3>([\s\S]*?)(?=<h3|<Row|$)/g);
  
  for (const match of sectionMatches) {
    const sectionTitle = match[1].trim();
    const sectionContent = match[2];
    
    // Extract paragraphs
    const paragraphs = [];
    const pMatches = sectionContent.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g);
    
    for (const pMatch of pMatches) {
      let text = pMatch[1]
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      if (text && text.length > 10) {
        paragraphs.push(text);
      }
    }
    
    if (paragraphs.length > 0) {
      result.sections.push({
        title: sectionTitle,
        content: paragraphs.join('\n\n'),
        layout: 'two-column'
      });
    }
  }
  
  // Extract metadata (list items)
  const metadataMatch = content.match(/Project Details[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/);
  if (metadataMatch) {
    const liMatches = metadataMatch[1].matchAll(/<li[^>]*>([^<]+):\s*([^<]+)<\/li>/g);
    for (const liMatch of liMatches) {
      const key = liMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
      result.metadata[key] = liMatch[2].trim();
    }
  }
  
  // Check if hero should be video (Voices Unheard special case)
  if (projectId === 'voices-unheard') {
    const firstVideoMatch = content.match(/<video[^>]*>[\s\S]*?<source[^>]+src=["']([^"']+)["']/);
    if (firstVideoMatch) {
      result.heroType = 'video';
      result.heroVideo = firstVideoMatch[1];
    }
  }
  
  return result;
}

// Parse projectData object from JSX
function extractProjectData(content) {
  const projectDataMatch = content.match(/const projectData = \{([\s\S]*?)\};/);
  if (!projectDataMatch) return null;
  
  const dataStr = projectDataMatch[1];
  const result = {};
  
  // Extract overview
  const overviewMatch = dataStr.match(/overview:\s*["'`]([\s\S]*?)["'`]/);
  if (overviewMatch) {
    result.overview = overviewMatch[1].replace(/\\"/g, '"').trim();
  }
  
  // Extract process
  const processMatch = dataStr.match(/process:\s*["'`]([\s\S]*?)["'`]/);
  if (processMatch) {
    result.process = processMatch[1].replace(/\\"/g, '"').trim();
  }
  
  // Extract services
  const servicesMatch = dataStr.match(/services:\s*\[([\s\S]*?)\]/);
  if (servicesMatch) {
    const services = servicesMatch[1].matchAll(/["']([^"']+)["']/g);
    result.services = Array.from(services, m => m[1]);
  }
  
  // Extract testimonial
  const testimonialMatch = dataStr.match(/testimonial:\s*\{([\s\S]*?)\}/);
  if (testimonialMatch) {
    const quoteMatch = testimonialMatch[1].match(/quote:\s*["'`]([\s\S]*?)["'`]/);
    const authorMatch = testimonialMatch[1].match(/author:\s*["']([^"']+)["']/);
    const companyMatch = testimonialMatch[1].match(/company:\s*["']([^"']+)["']/);
    
    if (quoteMatch) {
      result.testimonial = {
        quote: quoteMatch[1].replace(/\\"/g, '"').trim(),
        author: authorMatch ? authorMatch[1] : '',
        company: companyMatch ? companyMatch[1] : ''
      };
    }
  }
  
  return result;
}

// Update project in CMS
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
    throw new Error(`Failed to update project: ${error}`);
  }
  
  return await response.json();
}

// Main migration function
async function migrateProject(filename) {
  const projectId = PROJECT_MAPPINGS[filename];
  if (!projectId) {
    console.log(`⚠️  No mapping for ${filename}, skipping`);
    return;
  }
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📄 Processing: ${projectId}`);
  console.log('='.repeat(70));
  
  const filePath = path.join(__dirname, '.temp', 'original-projects', filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract content
  const textContent = extractTextContent(content, projectId);
  const projectData = extractProjectData(content);
  const imageUrls = extractImageUrls(content);
  const videoUrls = extractVideoUrls(content);
  
  console.log(`   Title: ${textContent.title}`);
  console.log(`   Sections: ${textContent.sections.length}`);
  console.log(`   Images: ${imageUrls.length}`);
  console.log(`   Videos: ${videoUrls.length}`);
  
  // Prepare update data
  const updateData = {
    title: textContent.title || projectId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    sections: textContent.sections,
    metadata: {
      date: textContent.metadata.date || '',
      client: textContent.metadata.client || '',
      role: textContent.metadata.role || '',
      exhibition: textContent.metadata.exhibition || '',
      curators: textContent.metadata.curators || '',
      collaborators: textContent.metadata.collaborators || '',
      technologies: textContent.metadata.technologies || ''
    }
  };
  
  // Add subtitle from projectData
  if (projectData && projectData.overview) {
    updateData.subtitle = projectData.overview.substring(0, 200) + '...';
  }
  
  // Add sections from projectData
  if (projectData) {
    if (projectData.overview) {
      updateData.sections.unshift({
        title: 'Overview',
        content: projectData.overview,
        layout: 'two-column'
      });
    }
    if (projectData.process) {
      updateData.sections.push({
        title: 'The Process',
        content: projectData.process,
        layout: 'two-column'
      });
    }
  }
  
  // Handle hero
  if (textContent.heroType === 'video' && textContent.heroVideo) {
    console.log(`   🎬 Setting video hero: ${textContent.heroVideo.substring(0, 60)}...`);
    updateData.hero = {
      type: 'video',
      video: textContent.heroVideo,
      alt: textContent.title
    };
  } else if (imageUrls.length > 0) {
    console.log(`   🖼️  Setting image hero: ${imageUrls[0].substring(0, 60)}...`);
    updateData.hero = {
      type: 'image',
      image: imageUrls[0],
      alt: textContent.title
    };
  }
  
  // Handle gallery - keep first image separate for hero, rest for gallery
  if (imageUrls.length > 1) {
    console.log(`   📸 Adding ${imageUrls.length - 1} images to gallery...`);
    updateData.gallery = imageUrls.slice(1).map(url => ({
      type: 'image',
      url: url,
      width: 'full'
    }));
  }
  
  // Add videos to gallery
  if (videoUrls.length > 0) {
    if (!updateData.gallery) updateData.gallery = [];
    videoUrls.forEach(url => {
      // Skip if this is the hero video
      if (url !== textContent.heroVideo) {
        updateData.gallery.push({
          type: 'video',
          url: url,
          width: 'full'
        });
      }
    });
  }
  
  // Update project
  try {
    await updateProject(projectId, updateData);
    console.log(`   ✅ Project updated successfully`);
  } catch (error) {
    console.log(`   ❌ Failed to update: ${error.message}`);
  }
  
  await new Promise(r => setTimeout(r, 500));
}

// Main execution
async function main() {
  console.log('🚀 Starting Project Content Migration\n');
  console.log('This will:');
  console.log('1. Parse original JSX files');
  console.log('2. Extract content, images, videos');
  console.log('3. Update Payload CMS with proper structure\n');
  
  if (!PAYLOAD_PASSWORD) {
    console.error('❌ Error: PAYLOAD_PASSWORD environment variable is required');
    process.exit(1);
  }
  
  await authenticate();
  
  const files = Object.keys(PROJECT_MAPPINGS);
  
  for (const file of files) {
    await migrateProject(file);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Migration Complete!');
  console.log('='.repeat(70));
  console.log('\nNext steps:');
  console.log('1. Review projects at: ' + CMS_URL + '/admin/collections/projects');
  console.log('2. Rebuild frontend: npm run build');
  console.log('3. Push to GitHub for Vercel deployment');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
