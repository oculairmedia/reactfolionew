#!/usr/bin/env node

/**
 * Content Sync Script
 * 
 * Fetches content from Payload CMS and updates local JSON fallback files.
 * This ensures the fallback content stays in sync with the CMS.
 * 
 * Usage:
 *   npm run sync:content
 *   node scripts/sync-content.js
 * 
 * Environment:
 *   CMS_API_URL - Override default CMS URL (default: http://localhost:3006/api)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CMS_API_URL = process.env.CMS_API_URL || 'http://localhost:3006/api';
const CONTENT_DIR = path.join(__dirname, '..', 'src', 'content');
const LOG_PREFIX = '[CMS Sync]';

// Sync configuration - maps CMS collections to local file paths
const SYNC_MAP = {
  // Settings (Global)
  'site-settings': {
    endpoint: '/globals/site-settings',
    outputPath: 'settings/site-settings.json',
    critical: true, // Fail build if this fails
    transform: (data) => {
      return {
        logotext: data.logotext || 'EMMANUEL',
        meta: {
          title: data.meta?.title || 'Emmanuel Umukoro',
          description: data.meta?.description || ''
        },
        contact: {
          email: data.contact?.email || '',
          description: data.contact?.description || '',
          serviceId: data.contact?.serviceId || '',
          templateId: data.contact?.templateId || '',
          publicKey: data.contact?.publicKey || ''
        },
        social: {
          github: data.social?.github || '',
          facebook: data.social?.facebook || '',
          linkedin: data.social?.linkedin || '',
          twitter: data.social?.twitter || ''
        }
      };
    }
  },

  // Home/Intro (Global)
  'home': {
    endpoint: '/globals/home-intro',
    outputPath: 'intro/home.json',
    critical: true,
    transform: (data) => {
      return {
        title: data.title || "I'm Emmanuel Umukoro",
        description: data.description || '',
        image_url: data.image_url || data.image?.url || '',
        animated: data.animated?.map(phrase => ({ 
          text: typeof phrase === 'string' ? phrase : phrase.text 
        })) || []
      };
    }
  },

  // About (Global)
  'about': {
    endpoint: '/globals/about-page',
    outputPath: 'about/about.json',
    transform: (data) => {
      return {
        title: data.title || 'About Me',
        aboutme: data.aboutme || '',
        timeline: data.timeline || [],
        skills: data.skills || [],
        services: data.services || []
      };
    }
  },

  // Navigation (Global)
  'navigation': {
    endpoint: '/globals/navigation',
    outputPath: 'settings/navigation.json',
    transform: (data) => {
      return data.items || data.navigation || [];
    }
  },

  // Footer (Global)
  'footer': {
    endpoint: '/globals/footer',
    outputPath: 'settings/footer.json',
    transform: (data) => {
      return {
        copyright: data.copyright || '',
        note: data.note || '',
        links: data.links || []
      };
    }
  },

  // Portfolio Page (Global)
  'portfolio-page': {
    endpoint: '/globals/portfolio-page',
    outputPath: 'pages/portfolio.json',
    transform: (data) => {
      return {
        title: data.title || 'Portfolio',
        description: data.description || '',
        meta_title: data.meta_title || data.title || 'Portfolio',
        meta_description: data.meta_description || data.description || ''
      };
    }
  },

  // Contact Page (Global)
  'contact-page': {
    endpoint: '/globals/contact-page',
    outputPath: 'pages/contact.json',
    transform: (data) => {
      return {
        title: data.title || 'Contact',
        description: data.description || '',
        meta_title: data.meta_title || data.title || 'Contact',
        meta_description: data.meta_description || data.description || ''
      };
    }
  },

  // UI Text (Global)
  'ui-text': {
    endpoint: '/globals/ui-text',
    outputPath: 'pages/ui-text.json',
    transform: (data) => {
      return data.strings || data;
    }
  },

  // Portfolio Items (collection)
  'portfolio': {
    endpoint: '/portfolio?limit=100&depth=1',
    outputPath: 'portfolio/',
    isCollection: true,
    critical: true,
    transform: (data) => {
      return data.docs || [];
    },
    itemTransform: (item) => ({
      id: item.id,
      title: item.title,
      img: item.img || item.featured_image?.cdn_url || item.featured_image?.url || item.image || '',
      isVideo: item.isVideo || false,
      description: item.short_description || item.description || '',
      link: item.link || `/portfolio/${item.id}`,
      order: item.order || 999,
      date: item.date || item.createdAt || ''
    }),
    itemFilename: (item) => `${item.id}.json`
  },

  // Projects (collection)
  'projects': {
    endpoint: '/projects?limit=100&depth=1',
    outputPath: 'projects/',
    isCollection: true,
    critical: true,
    transform: (data) => {
      return data.docs || [];
    },
    itemTransform: (item) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      content: item.content || '',
      featured_image: item.featured_image?.cdn_url || item.featured_image?.url || '',
      gallery: item.gallery?.map(img => img.cdn_url || img.url) || [],
      technologies: item.technologies || [],
      link: item.link || '',
      github: item.github || '',
      date: item.date || item.createdAt || ''
    }),
    itemFilename: (item) => `${item.id}.json`
  }
};

// Utility: HTTP(S) GET request
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode} from ${url}`));
        }
      });
    }).on('error', reject);
  });
}

// Utility: Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Utility: Write JSON file
function writeJsonFile(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// Sync a single endpoint
async function syncEndpoint(name, config) {
  const url = `${CMS_API_URL}${config.endpoint}`;
  
  console.log(`${LOG_PREFIX} Fetching ${name} from ${url}...`);
  
  try {
    const rawData = await fetchUrl(url);
    const transformedData = config.transform(rawData);
    
    if (config.isCollection) {
      // Handle collections (multiple files)
      const outputDir = path.join(CONTENT_DIR, config.outputPath);
      ensureDir(outputDir);
      
      let count = 0;
      for (const item of transformedData) {
        const itemData = config.itemTransform(item);
        const filename = config.itemFilename(item);
        const filePath = path.join(outputDir, filename);
        
        writeJsonFile(filePath, itemData);
        count++;
      }
      
      console.log(`${LOG_PREFIX} ✅ Synced ${count} ${name} items`);
    } else {
      // Handle single files
      const filePath = path.join(CONTENT_DIR, config.outputPath);
      writeJsonFile(filePath, transformedData);
      
      console.log(`${LOG_PREFIX} ✅ Synced ${name}`);
    }
    
    return { success: true, name, critical: config.critical };
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Failed to sync ${name}: ${error.message}`);
    return { success: false, name, error: error.message, critical: config.critical };
  }
}

// Main sync function
async function syncAll() {
  console.log(`${LOG_PREFIX} Starting content sync from ${CMS_API_URL}`);
  console.log(`${LOG_PREFIX} Target directory: ${CONTENT_DIR}`);
  console.log('');
  
  const results = [];
  
  for (const [name, config] of Object.entries(SYNC_MAP)) {
    const result = await syncEndpoint(name, config);
    results.push(result);
  }
  
  console.log('');
  console.log(`${LOG_PREFIX} ========================================`);
  console.log(`${LOG_PREFIX} Sync Complete!`);
  console.log(`${LOG_PREFIX} ========================================`);
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const criticalFailed = results.filter(r => !r.success && r.critical).length;
  
  console.log(`${LOG_PREFIX} ✅ Successful: ${successful}`);
  console.log(`${LOG_PREFIX} ❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('');
    console.log(`${LOG_PREFIX} Failed items:`);
    results.filter(r => !r.success).forEach(r => {
      const marker = r.critical ? '🔴 CRITICAL' : '⚠️  Optional';
      console.log(`${LOG_PREFIX}   - ${marker} ${r.name}: ${r.error}`);
    });
    
    if (criticalFailed > 0) {
      console.log('');
      console.log(`${LOG_PREFIX} ❌ ${criticalFailed} critical item(s) failed. Build cannot continue.`);
      process.exit(1);
    } else {
      console.log('');
      console.log(`${LOG_PREFIX} ⚠️  Some optional items failed, but critical content synced successfully.`);
    }
  }
  
  console.log('');
  console.log(`${LOG_PREFIX} 🎉 Content sync complete!`);
}

// Run if called directly
if (require.main === module) {
  syncAll().catch(error => {
    console.error(`${LOG_PREFIX} Fatal error:`, error);
    process.exit(1);
  });
}

module.exports = { syncAll, syncEndpoint };
