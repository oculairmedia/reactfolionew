const fs = require('fs');
const https = require('https');

const CMS_URL = 'https://cms2.emmanuelu.com';
const ADMIN_EMAIL = 'emanuvaderland@gmail.com';
const ADMIN_PASSWORD = '7beEXKPk93xSD6m';

let authToken = null;

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

async function createEntry(collection, data) {
  const response = await request(`${CMS_URL}/api/${collection}`, {
    method: 'POST',
    headers: { Authorization: `JWT ${authToken}` },
    body: data,
  });

  return response;
}

async function addMissingProjects() {
  if (!await login()) {
    process.exit(1);
  }

  // Add 3M VHB Tapes
  const project3m = JSON.parse(fs.readFileSync('./src/content/projects/3m-vhb-tapes.json', 'utf8'));
  const tags3m = (project3m.tags || []).map(tag => typeof tag === 'string' ? { tag } : tag);
  
  const projectData3m = {
    id: project3m.id,
    title: project3m.title,
    subtitle: project3m.subtitle || '',
    metadata: project3m.metadata || {},
    hero: project3m.hero || {},
    tags: tags3m,
    sections: project3m.sections || [],
    gallery: project3m.gallery || [],
  };

  console.log('\nAdding 3M VHB Tapes project...');
  const response = await createEntry('projects', projectData3m);
  if (response.status === 201) {
    console.log(`✓ Created project: ${project3m.title}`);
  } else {
    console.error(`✗ Failed to create project ${project3m.title}:`, response.data);
  }

  // Add portfolio item
  const portfolio3m = JSON.parse(fs.readFileSync('./src/content/portfolio/3m-vhb-tapes.json', 'utf8'));
  const portfolioTags = (portfolio3m.tags || []).map(tag => typeof tag === 'string' ? { tag } : tag);
  
  const portfolioData = {
    id: portfolio3m.id,
    title: portfolio3m.title,
    description: portfolio3m.description,
    isVideo: portfolio3m.isVideo || false,
    video: portfolio3m.video || '',
    img: portfolio3m.img || '',
    link: portfolio3m.link || '',
    date: portfolio3m.date || '',
    tags: portfolioTags,
  };

  console.log('Adding 3M VHB Tapes portfolio item...');
  const portfolioResponse = await createEntry('portfolio', portfolioData);
  if (portfolioResponse.status === 201) {
    console.log(`✓ Created portfolio item: ${portfolio3m.title}`);
  } else {
    console.error(`✗ Failed to create portfolio item:`, portfolioResponse.data);
  }

  console.log('\n✅ Done!');
}

addMissingProjects().catch(console.error);
