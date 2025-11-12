/**
 * Script to generate a Content API Key using Admin API credentials
 * Run this with: node scripts/get-ghost-content-key.js
 */

const jwt = require('jsonwebtoken');
const https = require('https');

// Your Ghost Admin API credentials
const GHOST_URL = 'https://blog.emmanuelu.com';
const GHOST_KEY_ID = '67b2d2824fdabf0001eb99ea';
const GHOST_KEY_SECRET = 'e0b7d2a5a7b2d2824fdabf0001eb99ea';

/**
 * Generate JWT token for Ghost Admin API
 */
function generateToken(keyId, keySecret) {
  // Split the key secret into key and secret parts
  const [id, secret] = keySecret.split(':').length === 2
    ? keySecret.split(':')
    : [keyId, keySecret];

  // Create the token (including decoding secret from hex)
  const token = jwt.sign(
    {},
    Buffer.from(secret, 'hex'),
    {
      keyid: id,
      algorithm: 'HS256',
      expiresIn: '5m',
      audience: '/admin/'
    }
  );

  return token;
}

/**
 * Make authenticated request to Ghost Admin API
 */
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const token = generateToken(GHOST_KEY_ID, GHOST_KEY_SECRET);
    const url = new URL(path, GHOST_URL);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Ghost ${token}`,
        'Content-Type': 'application/json',
        'Accept-Version': 'v5.0'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${body}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Get or create a custom integration for the Content API key
 */
async function getContentApiKey() {
  try {
    console.log('🔍 Checking for existing integrations...');

    // List all integrations
    const integrations = await makeRequest('/ghost/api/admin/integrations/');

    // Look for existing "React Portfolio" integration
    let integration = integrations.integrations?.find(
      i => i.name === 'React Portfolio Blog'
    );

    if (integration) {
      console.log('✅ Found existing integration: React Portfolio Blog');
    } else {
      console.log('📝 Creating new integration: React Portfolio Blog');

      // Create new integration
      const newIntegration = await makeRequest(
        '/ghost/api/admin/integrations/',
        'POST',
        {
          integrations: [{
            name: 'React Portfolio Blog',
            description: 'Integration for React portfolio to fetch blog posts'
          }]
        }
      );

      integration = newIntegration.integrations[0];
      console.log('✅ Integration created successfully!');
    }

    // Extract the Content API key
    const contentApiKey = integration.api_keys?.find(
      key => key.type === 'content'
    );

    if (!contentApiKey) {
      throw new Error('No Content API key found in integration');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 SUCCESS! Your Content API Key:');
    console.log('='.repeat(60));
    console.log('\n' + contentApiKey.secret + '\n');
    console.log('='.repeat(60));
    console.log('\n📋 Next steps:');
    console.log('1. Copy the key above');
    console.log('2. Open your .env file');
    console.log('3. Update this line:');
    console.log(`   REACT_APP_GHOST_KEY=${contentApiKey.secret}`);
    console.log('4. Restart your development server\n');

    return contentApiKey.secret;

  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('\n⚠️  Authentication failed. Please check:');
      console.error('   - GHOST_KEY_ID is correct');
      console.error('   - GHOST_KEY_SECRET is correct');
      console.error('   - Admin API credentials have not been revoked');
    }

    process.exit(1);
  }
}

// Run the script
getContentApiKey();
