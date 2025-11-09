const fs = require('fs');
const path = require('path');
const https = require('https');

const CMS_URL = process.env.CMS_URL || 'https://cms2.emmanuelu.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'emanuvaderland@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error('Error: ADMIN_PASSWORD environment variable is required');
  console.error('Usage: ADMIN_PASSWORD=your_password node migrate-to-cms.js');
  process.exit(1);
}

let authToken = null;

// Helper function to make HTTP requests
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
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

// Login to CMS
async function login() {
  console.log('Logging in to CMS...');
  const response = await request(`${CMS_URL}/api/users/login`, {
    method: 'POST',
    body: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    },
  });

  if (response.status === 200 && response.data.token) {
    authToken = response.data.token;
    console.log('✓ Logged in successfully');
    return true;
  }
  
  console.error('✗ Login failed:', response.data);
  return false;
}

// Create a CMS entry
async function createEntry(collection, data) {
  const response = await request(`${CMS_URL}/api/${collection}`, {
    method: 'POST',
    headers: { Authorization: `JWT ${authToken}` },
    body: data,
  });

  return response;
}

// Read JSON files from directory
function readJsonFiles(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    return JSON.parse(content);
  });
}

// Main migration function
async function migrate() {
  console.log('Starting migration to CMS...\n');

  // Login first
  if (!await login()) {
    process.exit(1);
  }

  // Import Projects
  console.log('\n--- Importing Projects ---');
  const projectFiles = fs.readdirSync('./src/content/projects');
  for (const file of projectFiles) {
    const project = JSON.parse(fs.readFileSync(`./src/content/projects/${file}`, 'utf8'));
    
    // Transform tags array format if needed
    const tags = (project.tags || []).map(tag => {
      return typeof tag === 'string' ? { tag } : tag;
    });
    
    const projectData = {
      id: project.id,
      title: project.title,
      subtitle: project.subtitle || '',
      metadata: project.metadata || {},
      hero: project.hero || {},
      tags: tags,
      sections: project.sections || [],
      gallery: project.gallery || [],
    };

    const response = await createEntry('projects', projectData);
    if (response.status === 201) {
      console.log(`✓ Created project: ${project.title}`);
    } else {
      console.error(`✗ Failed to create project ${project.title}:`, response.data);
    }
  }

  // Import Portfolio Items
  console.log('\n--- Importing Portfolio Items ---');
  const portfolioFiles = fs.readdirSync('./src/content/portfolio');
  for (const file of portfolioFiles) {
    const item = JSON.parse(fs.readFileSync(`./src/content/portfolio/${file}`, 'utf8'));
    
    // Transform tags array format if needed
    const tags = (item.tags || []).map(tag => {
      return typeof tag === 'string' ? { tag } : tag;
    });
    
    const portfolioData = {
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

    const response = await createEntry('portfolio', portfolioData);
    if (response.status === 201) {
      console.log(`✓ Created portfolio item: ${portfolioData.title}`);
    } else {
      console.error(`✗ Failed to create portfolio item ${portfolioData.title}:`, response.data);
    }
  }

  console.log('\n✅ Migration complete!');
}

// Run migration
migrate().catch(console.error);
