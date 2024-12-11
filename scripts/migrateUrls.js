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
const STORAGE_ZONE_URL = `https://${STORAGE_ZONE}.b-cdn.net`;

// URL patterns to look for
const URL_PATTERNS = [
    /https?:\/\/files\.oculair\.ca\/[^"`'\s]+/g,
    /https?:\/\/oculair\.ca\/[^"`'\s]+/g
];

// Function to download and get content
async function getFileContent(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            const chunks = [];
            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve(buffer);
            });
        }).on('error', reject);
    });
}

// Function to upload to BunnyCDN
async function uploadToBunny(fileContent, relativePath) {
    const options = {
        method: 'PUT',
        host: 'la.storage.bunnycdn.com',
        path: `/${STORAGE_ZONE}/${encodeURIComponent(relativePath)}`,
        headers: {
            'AccessKey': BUNNY_STORAGE_PASSWORD,
            'Content-Type': mime.lookup(relativePath) || 'application/octet-stream',
            'Content-Length': fileContent.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode === 201) {
                console.log(`📤 Uploaded: ${relativePath}`);
                const bunnyUrl = `${STORAGE_ZONE_URL}/${relativePath}`;
                resolve(bunnyUrl);
            } else {
                reject(new Error(`Failed to upload ${relativePath}: ${res.statusCode}`));
            }
        });

        req.on('error', reject);
        req.write(fileContent);
        req.end();
    });
}

// Function to find URLs in a file
function findUrlsInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const urls = new Set();
    
    URL_PATTERNS.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
            matches.forEach(url => urls.add(url));
        }
    });
    
    return Array.from(urls);
}

// Function to replace URLs in a file
function replaceUrlsInFile(filePath, urlMap) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    for (const [originalUrl, bunnyUrl] of Object.entries(urlMap)) {
        content = content.replace(new RegExp(originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), bunnyUrl);
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`📝 Updated URLs in: ${filePath}`);
}

// Main function to process files
async function processFiles(sourceDir) {
    const urlMap = new Map();
    const processedUrls = new Set();
    
    // Walk through the directory
    function walkDir(dir) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                if (!file.startsWith('node_modules') && !file.startsWith('.')) {
                    walkDir(fullPath);
                }
            } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
                console.log(`🔍 Scanning: ${fullPath}`);
                const urls = findUrlsInFile(fullPath);
                urls.forEach(url => {
                    if (!processedUrls.has(url)) {
                        processedUrls.add(url);
                        urlMap.set(fullPath, urls);
                    }
                });
            }
        });
    }

    // Start walking from source directory
    walkDir(sourceDir);

    // Process all found URLs
    const urlMappings = {};
    for (const [filePath, urls] of urlMap.entries()) {
        for (const url of urls) {
            try {
                console.log(`🔄 Processing URL: ${url}`);
                const urlObj = new URL(url);
                // Get the path without the domain
                const relativePath = urlObj.pathname.startsWith('/') ? 
                    urlObj.pathname.slice(1) : 
                    urlObj.pathname;
                
                const fileContent = await getFileContent(url);
                const bunnyUrl = await uploadToBunny(fileContent, relativePath);
                urlMappings[url] = bunnyUrl;
                console.log(`✅ Processed ${url} -> ${bunnyUrl}`);
            } catch (error) {
                console.error(`❌ Error processing ${url}:`, error.message);
            }
        }

        // Replace URLs in the file
        if (Object.keys(urlMappings).length > 0) {
            replaceUrlsInFile(filePath, urlMappings);
        }
    }

    console.log('✨ URL migration complete!');
    console.log('📊 URL Mappings:', urlMappings);
}

// Start processing from the src directory
const sourceDir = path.join(__dirname, '../src');
processFiles(sourceDir).catch(console.error);
