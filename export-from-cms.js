/**
 * Export Payload CMS Content to JSON Files
 *
 * This script exports all content from Payload CMS back to static JSON files.
 * Useful for:
 * - Backing up content
 * - Migrating away from CMS
 * - Creating static fallback data
 * - Version control of content
 *
 * Usage:
 *   node export-from-cms.js
 *   node export-from-cms.js --output ./backup
 *   node export-from-cms.js --collections projects,portfolio
 *   node export-from-cms.js --include-globals
 */

const fs = require('fs');
const path = require('path');

// ==========================================
// CONFIGURATION
// ==========================================

const CMS_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const OUTPUT_DIR = process.argv.find(arg => arg.startsWith('--output='))?.split('=')[1] || './cms-export';
const COLLECTIONS_ARG = process.argv.find(arg => arg.startsWith('--collections='));
const INCLUDE_GLOBALS = process.argv.includes('--include-globals');
const VERBOSE = process.argv.includes('--verbose');

const COLLECTIONS_TO_EXPORT = COLLECTIONS_ARG
  ? COLLECTIONS_ARG.split('=')[1].split(',')
  : ['projects', 'portfolio'];

const GLOBALS_TO_EXPORT = ['site-settings', 'home-intro', 'about-page'];

// ==========================================
// LOGGING
// ==========================================

function log(message, data = '') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data);
}

function logError(message, error = '') {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ❌ ${message}`, error);
}

function logSuccess(message, data = '') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ✅ ${message}`, data);
}

function logVerbose(message, data = '') {
  if (VERBOSE) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔍 ${message}`, data);
  }
}

// ==========================================
// HTTP REQUEST HELPER
// ==========================================

async function fetchFromCMS(endpoint) {
  try {
    const url = `${CMS_URL}${endpoint}`;
    logVerbose(`Fetching: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logError(`Failed to fetch ${endpoint}:`, error.message);
    throw error;
  }
}

// ==========================================
// FILE SYSTEM HELPERS
// ==========================================

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logVerbose(`Created directory: ${dirPath}`);
  }
}

function writeJSONFile(filePath, data) {
  const jsonString = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonString, 'utf8');
  logVerbose(`Written file: ${filePath}`);
}

// ==========================================
// DATA TRANSFORMATION
// ==========================================

function transformProject(project) {
  return {
    id: project.id,
    title: project.title,
    subtitle: project.subtitle || '',
    metadata: project.metadata || {},
    hero: project.hero || {},
    tags: project.tags || [],
    sections: project.sections || [],
    gallery: project.gallery || [],
  };
}

function transformPortfolioItem(item) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    isVideo: item.isVideo || false,
    video: item.video || '',
    img: item.img || '',
    link: item.link || '',
    date: item.date || '',
    tags: item.tags || [],
  };
}

function transformSiteSettings(settings) {
  return {
    logotext: settings.logotext?.text || '',
    meta: {
      title: settings.meta?.title || '',
      description: settings.meta?.description || '',
    },
    contact: {
      email: settings.contact?.email || '',
      description: settings.contact?.description || '',
      serviceId: settings.contact?.serviceId || '',
      templateId: settings.contact?.templateId || '',
      publicKey: settings.contact?.publicKey || '',
    },
    social: {
      github: settings.social?.github || '',
      facebook: settings.social?.facebook || '',
      linkedin: settings.social?.linkedin || '',
      twitter: settings.social?.twitter || '',
    },
  };
}

function transformHomeIntro(intro) {
  // Transform animated array from objects to simple key-value pairs
  const animated = {};
  if (intro.animated && Array.isArray(intro.animated)) {
    const keys = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];
    intro.animated.forEach((item, index) => {
      if (index < keys.length && item.item) {
        animated[keys[index]] = item.item;
      }
    });
  }

  return {
    title: intro.title || '',
    description: intro.description || '',
    your_img_url: intro.image_url || '',
    animated,
  };
}

function transformAboutPage(about) {
  return {
    title: about.title || '',
    aboutme: about.aboutme || '',
    worktimeline: about.timeline || [],
    skills: about.skills || [],
    services: about.services || [],
  };
}

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

async function exportCollection(collectionName, outputPath, transformer) {
  try {
    log(`Exporting collection: ${collectionName}`);

    const response = await fetchFromCMS(`/${collectionName}?limit=1000`);
    const items = response.docs || [];

    logVerbose(`Found ${items.length} items in ${collectionName}`);

    // Transform items if transformer provided
    const transformedItems = transformer
      ? items.map(transformer)
      : items;

    // Export as array
    const arrayFilePath = path.join(outputPath, `${collectionName}.json`);
    writeJSONFile(arrayFilePath, transformedItems);

    // Export individual files for each item
    const itemsDir = path.join(outputPath, collectionName);
    ensureDirectoryExists(itemsDir);

    transformedItems.forEach(item => {
      const itemFilePath = path.join(itemsDir, `${item.id}.json`);
      writeJSONFile(itemFilePath, item);
    });

    logSuccess(`Exported ${transformedItems.length} items from ${collectionName}`);

    return {
      collection: collectionName,
      count: transformedItems.length,
      success: true,
    };
  } catch (error) {
    logError(`Failed to export ${collectionName}:`, error.message);
    return {
      collection: collectionName,
      count: 0,
      success: false,
      error: error.message,
    };
  }
}

async function exportGlobal(globalSlug, outputPath, transformer) {
  try {
    log(`Exporting global: ${globalSlug}`);

    const data = await fetchFromCMS(`/globals/${globalSlug}`);

    logVerbose(`Retrieved global: ${globalSlug}`);

    // Transform data if transformer provided
    const transformedData = transformer ? transformer(data) : data;

    const filePath = path.join(outputPath, `${globalSlug}.json`);
    writeJSONFile(filePath, transformedData);

    logSuccess(`Exported global: ${globalSlug}`);

    return {
      global: globalSlug,
      success: true,
    };
  } catch (error) {
    logError(`Failed to export ${globalSlug}:`, error.message);
    return {
      global: globalSlug,
      success: false,
      error: error.message,
    };
  }
}

// ==========================================
// METADATA EXPORT
// ==========================================

function exportMetadata(outputPath, results) {
  const metadata = {
    exportDate: new Date().toISOString(),
    cmsUrl: CMS_URL,
    collections: results.collections,
    globals: results.globals,
    totalItems: results.collections.reduce((sum, c) => sum + (c.count || 0), 0),
    success: results.collections.every(c => c.success) &&
             (!results.globals || results.globals.every(g => g.success)),
  };

  const metadataPath = path.join(outputPath, '_metadata.json');
  writeJSONFile(metadataPath, metadata);

  logSuccess('Exported metadata');
}

// ==========================================
// MAIN EXPORT FUNCTION
// ==========================================

async function exportAllContent() {
  console.log('\n🚀 Starting CMS Export...\n');
  console.log(`CMS URL: ${CMS_URL}`);
  console.log(`Output Directory: ${OUTPUT_DIR}`);
  console.log(`Collections: ${COLLECTIONS_TO_EXPORT.join(', ')}`);
  if (INCLUDE_GLOBALS) {
    console.log(`Globals: ${GLOBALS_TO_EXPORT.join(', ')}`);
  }
  console.log('');

  // Create output directory
  ensureDirectoryExists(OUTPUT_DIR);

  const results = {
    collections: [],
    globals: [],
  };

  // Export collections
  for (const collection of COLLECTIONS_TO_EXPORT) {
    let transformer;
    if (collection === 'projects') transformer = transformProject;
    if (collection === 'portfolio') transformer = transformPortfolioItem;

    const result = await exportCollection(
      collection,
      path.join(OUTPUT_DIR, 'collections'),
      transformer
    );
    results.collections.push(result);
  }

  // Export globals if requested
  if (INCLUDE_GLOBALS) {
    console.log('');
    for (const globalSlug of GLOBALS_TO_EXPORT) {
      let transformer;
      if (globalSlug === 'site-settings') transformer = transformSiteSettings;
      if (globalSlug === 'home-intro') transformer = transformHomeIntro;
      if (globalSlug === 'about-page') transformer = transformAboutPage;

      const result = await exportGlobal(
        globalSlug,
        path.join(OUTPUT_DIR, 'globals'),
        transformer
      );
      results.globals.push(result);
    }
  }

  // Export metadata
  console.log('');
  exportMetadata(OUTPUT_DIR, results);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 EXPORT SUMMARY');
  console.log('='.repeat(50));

  console.log('\nCollections:');
  results.collections.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`  ${status} ${r.collection}: ${r.count || 0} items`);
    if (r.error) console.log(`      Error: ${r.error}`);
  });

  if (results.globals && results.globals.length > 0) {
    console.log('\nGlobals:');
    results.globals.forEach(r => {
      const status = r.success ? '✅' : '❌';
      console.log(`  ${status} ${r.global}`);
      if (r.error) console.log(`      Error: ${r.error}`);
    });
  }

  const totalSuccess = results.collections.filter(r => r.success).length +
                       (results.globals?.filter(r => r.success).length || 0);
  const totalFailed = results.collections.filter(r => !r.success).length +
                      (results.globals?.filter(r => !r.success).length || 0);

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Successful: ${totalSuccess}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log('='.repeat(50));

  if (totalFailed === 0) {
    console.log('\n🎉 All content exported successfully!');
    console.log(`📁 Output directory: ${path.resolve(OUTPUT_DIR)}`);
  } else {
    console.log('\n⚠️  Some exports failed. Check the errors above.');
    process.exit(1);
  }
}

// ==========================================
// CLI HELP
// ==========================================

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Payload CMS Content Exporter

Usage:
  node export-from-cms.js [options]

Options:
  --output=<path>            Output directory (default: ./cms-export)
  --collections=<list>       Comma-separated list of collections (default: projects,portfolio)
  --include-globals          Also export global singletons
  --verbose                  Enable verbose logging
  --help, -h                 Show this help message

Examples:
  node export-from-cms.js
  node export-from-cms.js --output=./backup
  node export-from-cms.js --collections=projects --verbose
  node export-from-cms.js --include-globals
  `);
  process.exit(0);
}

// ==========================================
// RUN EXPORT
// ==========================================

exportAllContent().catch(error => {
  logError('Export failed:', error);
  process.exit(1);
});
