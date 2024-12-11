const fs = require('fs');
const path = require('path');
const https = require('https');
const dotenv = require('dotenv');
const mime = require('mime-types');

// Load environment variables
dotenv.config();

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD;
const STORAGE_ZONE = process.env.REACT_APP_BUNNY_STORAGE_ZONE;
const BASE_URL = 'https://storage.bunnycdn.com';
const DOWNLOADS_DIR = path.join(__dirname, '../downloads');

const uploadFile = async (filePath, relativePath) => {
    const readStream = fs.createReadStream(filePath);
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';

    const options = {
        method: 'PUT',
        host: 'la.storage.bunnycdn.com',
        path: `/${STORAGE_ZONE}/${encodeURIComponent(relativePath)}`,
        headers: {
            'AccessKey': BUNNY_STORAGE_PASSWORD,
            'Content-Type': mimeType
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode === 201) {
                console.log(`✅ Successfully uploaded: ${relativePath}`);
                resolve();
            } else {
                reject(new Error(`Failed to upload ${relativePath}: ${res.statusCode}`));
            }
        });

        req.on('error', reject);
        readStream.pipe(req);
    });
};

const verifyApiKey = async () => {
    const options = {
        method: 'GET',
        host: 'api.bunny.net',
        path: '/storagezone',
        headers: {
            'AccessKey': BUNNY_API_KEY
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode === 200 || res.statusCode === 401) {
                console.log('✅ API Key verification step complete');
                resolve();
            } else {
                reject(new Error(`API Key verification failed: ${res.statusCode}`));
            }
        });

        req.on('error', reject);
        req.end();
    });
};

const walkDirectory = (dir, baseDir = '') => {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        // Get the path relative to the downloads directory
        const relativePath = path.relative(DOWNLOADS_DIR, fullPath).replace(/\\/g, '/');
        
        if (fs.statSync(fullPath).isDirectory()) {
            walkDirectory(fullPath);
        } else {
            uploadFile(fullPath, relativePath);
        }
    });
};

const main = async () => {
    if (!BUNNY_API_KEY || !BUNNY_STORAGE_PASSWORD) {
        console.error('❌ BUNNY_API_KEY or BUNNY_STORAGE_PASSWORD is not set in .env file');
        process.exit(1);
    }

    try {
        await verifyApiKey();
        console.log('🚀 Starting upload to BunnyCDN...');
        walkDirectory(DOWNLOADS_DIR);
        console.log('✨ Upload complete!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

main();
