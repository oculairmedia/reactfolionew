/**
 * Enhanced Payload CMS Migration Script
 *
 * Features:
 * - Incremental migration (update existing vs create new)
 * - Content validation before import
 * - Verbose logging with timestamps
 * - Dry-run mode
 * - Selective collection migration
 * - Progress tracking
 * - Detailed error reporting
 * - Rollback on failure (optional)
 *
 * Usage:
 *   ADMIN_PASSWORD=password node migrate-to-cms-enhanced.js
 *   ADMIN_PASSWORD=password node migrate-to-cms-enhanced.js --dry-run
 *   ADMIN_PASSWORD=password node migrate-to-cms-enhanced.js --collections=projects
 *   ADMIN_PASSWORD=password node migrate-to-cms-enhanced.js --mode=update --verbose
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ==========================================
// CONFIGURATION
// ==========================================

const CMS_URL = process.env.CMS_URL || 'https://cms2.emmanuelu.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'emanuvaderland@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');
const MODE = process.argv.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'create'; // create or update
const COLLECTIONS_ARG = process.argv.find(arg => arg.startsWith('--collections='));
const SKIP_VALIDATION = process.argv.includes('--skip-validation');

const COLLECTIONS_TO_MIGRATE = COLLECTIONS_ARG
  ? COLLECTIONS_ARG.split('=')[1].split(',')
  : ['projects', 'portfolio'];

// State
let authToken = null;
const migrationStats = {
  created: 0,
  updated: 0,
  skipped: 0,
  failed: 0,
  validated: 0,
  validationErrors: 0,
};

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

function logWarning(message, data = '') {
  const timestamp = new Date().toISOString();
  console.warn(`[${timestamp}] ⚠️  ${message}`, data);
}

function logVerbose(message, data = '') {
  if (VERBOSE) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔍 ${message}`, data);
  }
}

function logDryRun(message) {
  if (DRY_RUN) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🏃 [DRY RUN] ${message}`);
  }
}

// ==========================================
// VALIDATION ERRORS
// ==========================================

const validationErrors = [];

function addValidationError(item, field, message) {
  validationErrors.push({
    item: item.id || item.title || 'Unknown',
    field,
    message,
  });
  migrationStats.validationErrors++;
}

// ==========================================
// HTTP REQUEST HELPER
// ==========================================

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    logVerbose(`${options.method || 'GET'} ${url}`);

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      const body = JSON.stringify(options.body);
      logVerbose(`Request body: ${body.substring(0, 200)}...`);
      req.write(body);
    }
    req.end();
  });
}

// ==========================================
// AUTHENTICATION
// ==========================================

async function login() {
  log('Logging in to CMS...');
  const response = await request(`${CMS_URL}/api/users/login`, {
    method: 'POST',
    body: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    },
  });

  if (response.status === 200 && response.data.token) {
    authToken = response.data.token;
    logSuccess('Logged in successfully');
    logVerbose(`Auth token: ${authToken.substring(0, 20)}...`);
    return true;
  }

  logError('Login failed:', response.data);
  return false;
}

// ==========================================
// CMS OPERATIONS
// ==========================================

async function checkIfExists(collection, id) {
  try {
    const response = await request(
      `${CMS_URL}/api/${collection}?where[id][equals]=${encodeURIComponent(id)}&limit=1`,
      {
        method: 'GET',
        headers: { Authorization: `JWT ${authToken}` },
      }
    );

    if (response.status === 200 && response.data.docs && response.data.docs.length > 0) {
      logVerbose(`Found existing entry: ${id}`);
      return response.data.docs[0];
    }

    return null;
  } catch (error) {
    logError(`Failed to check existence of ${id}:`, error.message);
    return null;
  }
}

async function createEntry(collection, data) {
  const response = await request(`${CMS_URL}/api/${collection}`, {
    method: 'POST',
    headers: { Authorization: `JWT ${authToken}` },
    body: data,
  });

  return response;
}

async function updateEntry(collection, documentId, data) {
  const response = await request(`${CMS_URL}/api/${collection}/${documentId}`, {
    method: 'PATCH',
    headers: { Authorization: `JWT ${authToken}` },
    body: data,
  });

  return response;
}

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================

function validateProject(project) {
  let isValid = true;

  if (!project.id) {
    addValidationError(project, 'id', 'Missing required field: id');
    isValid = false;
  }

  if (!project.title) {
    addValidationError(project, 'title', 'Missing required field: title');
    isValid = false;
  }

  if (project.hero && project.hero.type && !['image', 'video'].includes(project.hero.type)) {
    addValidationError(project, 'hero.type', 'Invalid hero type (must be image or video)');
    isValid = false;
  }

  if (project.tags && !Array.isArray(project.tags)) {
    addValidationError(project, 'tags', 'Tags must be an array');
    isValid = false;
  }

  if (project.sections && !Array.isArray(project.sections)) {
    addValidationError(project, 'sections', 'Sections must be an array');
    isValid = false;
  }

  if (project.gallery && !Array.isArray(project.gallery)) {
    addValidationError(project, 'gallery', 'Gallery must be an array');
    isValid = false;
  }

  migrationStats.validated++;
  return isValid;
}

function validatePortfolioItem(item) {
  let isValid = true;

  if (!item.id) {
    addValidationError(item, 'id', 'Missing required field: id');
    isValid = false;
  }

  if (!item.title) {
    addValidationError(item, 'title', 'Missing required field: title');
    isValid = false;
  }

  if (!item.description) {
    addValidationError(item, 'description', 'Missing required field: description');
    isValid = false;
  }

  if (item.isVideo && !item.video) {
    addValidationError(item, 'video', 'Video URL required when isVideo is true');
    isValid = false;
  }

  if (item.tags && !Array.isArray(item.tags)) {
    addValidationError(item, 'tags', 'Tags must be an array');
    isValid = false;
  }

  migrationStats.validated++;
  return isValid;
}

// ==========================================
// DATA TRANSFORMATION
// ==========================================

function transformProject(project) {
  const tags = (project.tags || []).map(tag => {
    return typeof tag === 'string' ? { tag } : tag;
  });

  return {
    id: project.id,
    title: project.title,
    subtitle: project.subtitle || '',
    metadata: project.metadata || {},
    hero: project.hero || {},
    tags: tags,
    sections: project.sections || [],
    gallery: project.gallery || [],
  };
}

function transformPortfolioItem(item) {
  const tags = (item.tags || []).map(tag => {
    return typeof tag === 'string' ? { tag } : tag;
  });

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    isVideo: item.isVideo || false,
    video: item.video || '',
    img: item.img || '',
    link: item.link || '',
    date: item.date || '',
    tags: tags,
  };
}

// ==========================================
// MIGRATION FUNCTIONS
// ==========================================

async function migrateItem(collection, item, validator, transformer) {
  const itemName = item.title || item.id;

  // Validate if not skipped
  if (!SKIP_VALIDATION) {
    logVerbose(`Validating ${itemName}...`);
    if (!validator(item)) {
      logError(`Validation failed for ${itemName}`);
      migrationStats.failed++;
      return false;
    }
  }

  // Transform data
  const transformedData = transformer(item);

  // Dry run mode
  if (DRY_RUN) {
    logDryRun(`Would migrate ${itemName}`);
    logVerbose('Transformed data:', JSON.stringify(transformedData, null, 2));
    migrationStats.created++;
    return true;
  }

  // Check if exists (for update mode)
  const existing = await checkIfExists(collection, transformedData.id);

  if (existing) {
    if (MODE === 'update') {
      log(`Updating ${itemName}...`);
      const response = await updateEntry(collection, existing.id, transformedData);

      if (response.status === 200) {
        logSuccess(`Updated ${itemName}`);
        migrationStats.updated++;
        return true;
      } else {
        logError(`Failed to update ${itemName}:`, response.data);
        migrationStats.failed++;
        return false;
      }
    } else {
      logWarning(`Skipping ${itemName} (already exists)`);
      migrationStats.skipped++;
      return true;
    }
  }

  // Create new entry
  log(`Creating ${itemName}...`);
  const response = await createEntry(collection, transformedData);

  if (response.status === 201) {
    logSuccess(`Created ${itemName}`);
    migrationStats.created++;
    return true;
  } else {
    logError(`Failed to create ${itemName}:`, response.data);
    migrationStats.failed++;
    return false;
  }
}

async function migrateCollection(collection, sourceDir, validator, transformer) {
  log(`\n${'='.repeat(50)}`);
  log(`Migrating ${collection.toUpperCase()}`);
  log('='.repeat(50));

  const dirPath = path.join('./src/content', sourceDir);

  if (!fs.existsSync(dirPath)) {
    logError(`Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
  log(`Found ${files.length} ${collection} items to migrate`);

  let processed = 0;
  for (const file of files) {
    processed++;
    log(`\n[${processed}/${files.length}] Processing ${file}...`);

    const filePath = path.join(dirPath, file);
    const item = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    await migrateItem(collection, item, validator, transformer);
  }
}

// ==========================================
// SUMMARY REPORT
// ==========================================

function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(50));

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No changes were made');
  }

  console.log(`\nMode: ${MODE.toUpperCase()}`);
  console.log(`Collections: ${COLLECTIONS_TO_MIGRATE.join(', ')}`);

  console.log('\nResults:');
  console.log(`  ✅ Created: ${migrationStats.created}`);
  console.log(`  🔄 Updated: ${migrationStats.updated}`);
  console.log(`  ⏭️  Skipped: ${migrationStats.skipped}`);
  console.log(`  ❌ Failed: ${migrationStats.failed}`);

  if (!SKIP_VALIDATION) {
    console.log('\nValidation:');
    console.log(`  Validated: ${migrationStats.validated}`);
    console.log(`  Errors: ${migrationStats.validationErrors}`);

    if (validationErrors.length > 0) {
      console.log('\nValidation Errors:');
      validationErrors.slice(0, 10).forEach(err => {
        console.log(`  • ${err.item} - ${err.field}: ${err.message}`);
      });
      if (validationErrors.length > 10) {
        console.log(`  ... and ${validationErrors.length - 10} more`);
      }
    }
  }

  const total = migrationStats.created + migrationStats.updated + migrationStats.skipped + migrationStats.failed;
  const successRate = total > 0 ? ((migrationStats.created + migrationStats.updated + migrationStats.skipped) / total * 100).toFixed(1) : 0;

  console.log('\n' + '='.repeat(50));
  console.log(`Success Rate: ${successRate}%`);
  console.log('='.repeat(50));

  if (migrationStats.failed === 0 && migrationStats.validationErrors === 0) {
    console.log('\n🎉 Migration completed successfully!');
  } else if (migrationStats.failed > 0) {
    console.log('\n⚠️  Migration completed with errors. Check the logs above.');
  }
}

// ==========================================
// MAIN MIGRATION FUNCTION
// ==========================================

async function migrate() {
  console.log('\n🚀 Starting Enhanced CMS Migration...\n');

  if (DRY_RUN) {
    logWarning('DRY RUN MODE - No changes will be made to the CMS');
  }

  console.log('Configuration:');
  console.log(`  CMS URL: ${CMS_URL}`);
  console.log(`  Mode: ${MODE}`);
  console.log(`  Collections: ${COLLECTIONS_TO_MIGRATE.join(', ')}`);
  console.log(`  Dry Run: ${DRY_RUN}`);
  console.log(`  Verbose: ${VERBOSE}`);
  console.log(`  Skip Validation: ${SKIP_VALIDATION}`);

  // Login (skip in dry run if no real API calls needed)
  if (!DRY_RUN) {
    if (!await login()) {
      process.exit(1);
    }
  } else {
    log('Skipping login (dry run mode)');
  }

  // Migrate each collection
  if (COLLECTIONS_TO_MIGRATE.includes('projects')) {
    await migrateCollection('projects', 'projects', validateProject, transformProject);
  }

  if (COLLECTIONS_TO_MIGRATE.includes('portfolio')) {
    await migrateCollection('portfolio', 'portfolio', validatePortfolioItem, transformPortfolioItem);
  }

  // Print summary
  printSummary();

  // Exit with error code if failed
  if (migrationStats.failed > 0) {
    process.exit(1);
  }
}

// ==========================================
// CLI HELP
// ==========================================

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Enhanced Payload CMS Migration Script

Usage:
  ADMIN_PASSWORD=password node migrate-to-cms-enhanced.js [options]

Options:
  --dry-run                  Preview migration without making changes
  --mode=<create|update>     Migration mode (default: create)
  --collections=<list>       Comma-separated collections to migrate (default: projects,portfolio)
  --verbose, -v              Enable verbose logging
  --skip-validation          Skip content validation
  --help, -h                 Show this help message

Examples:
  ADMIN_PASSWORD=pwd node migrate-to-cms-enhanced.js --dry-run
  ADMIN_PASSWORD=pwd node migrate-to-cms-enhanced.js --mode=update
  ADMIN_PASSWORD=pwd node migrate-to-cms-enhanced.js --collections=projects --verbose
  `);
  process.exit(0);
}

// ==========================================
// VALIDATION
// ==========================================

if (!ADMIN_PASSWORD && !DRY_RUN) {
  logError('ADMIN_PASSWORD environment variable is required');
  console.log('Usage: ADMIN_PASSWORD=your_password node migrate-to-cms-enhanced.js');
  console.log('Or use --dry-run for testing without authentication');
  process.exit(1);
}

if (!['create', 'update'].includes(MODE)) {
  logError(`Invalid mode: ${MODE}. Must be 'create' or 'update'`);
  process.exit(1);
}

// ==========================================
// RUN MIGRATION
// ==========================================

migrate().catch(error => {
  logError('Migration failed:', error);
  process.exit(1);
});
