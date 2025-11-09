const fs = require('fs');
const path = require('path');
const https = require('https');
const dotenv = require('dotenv');
const mime = require('mime-types');

// Load environment variables
dotenv.config();

const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD;
const STORAGE_ZONE = process.env.REACT_APP_BUNNY_STORAGE_ZONE || 'oculair';
const PROJECTS_DIR = path.join(__dirname, '../public/images/projects');

// Track uploaded files and their CDN URLs
const uploadedFiles = {};

const uploadFile = async (filePath, cdnPath) => {
    const readStream = fs.createReadStream(filePath);
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';

    const options = {
        method: 'PUT',
        host: 'la.storage.bunnycdn.com',
        path: `/${STORAGE_ZONE}/${cdnPath}`,
        headers: {
            'AccessKey': BUNNY_STORAGE_PASSWORD,
            'Content-Type': mimeType
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 201) {
                    const cdnUrl = `https://oculair.b-cdn.net/${cdnPath}`;
                    console.log(`✅ Uploaded: ${path.basename(filePath)} -> ${cdnUrl}`);
                    uploadedFiles[filePath] = cdnUrl;
                    resolve(cdnUrl);
                } else {
                    console.error(`❌ Failed: ${path.basename(filePath)} (${res.statusCode})`);
                    console.error(`Response: ${responseBody}`);
                    reject(new Error(`Upload failed: ${res.statusCode} - ${responseBody}`));
                }
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Network error for ${path.basename(filePath)}:`, error.message);
            reject(error);
        });

        readStream.on('error', (error) => {
            console.error(`❌ File read error for ${filePath}:`, error.message);
            reject(error);
        });

        readStream.pipe(req);
    });
};

const walkDirectory = async (dir, baseDir = dir) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);

        if (fs.statSync(fullPath).isDirectory()) {
            await walkDirectory(fullPath, baseDir);
        } else {
            // Skip non-image files
            if (!file.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                console.log(`⏭️  Skipping non-image: ${file}`);
                continue;
            }

            // Create CDN path: cache/images/projects/{subdirs}/{filename}
            const relativePath = path.relative(baseDir, fullPath);
            const cdnPath = `cache/images/projects/${relativePath}`.replace(/\\/g, '/');

            try {
                await uploadFile(fullPath, cdnPath);
                // Small delay to avoid overwhelming the API
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`Failed to upload ${file}:`, error.message);
            }
        }
    }
};

const updateProjectJson = (projectFile, urlMappings) => {
    const jsonPath = path.join(__dirname, '../src/content/projects', projectFile);
    const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let updated = false;

    // Update hero image
    if (content.hero && content.hero.image && content.hero.image.startsWith('/images/projects/')) {
        const localPath = content.hero.image.replace('/images/projects/', '');
        const cdnUrl = urlMappings[localPath];
        if (cdnUrl) {
            content.hero.image = cdnUrl;
            updated = true;
            console.log(`  Updated hero: ${path.basename(cdnUrl)}`);
        }
    }

    // Update gallery images
    if (content.gallery && Array.isArray(content.gallery)) {
        content.gallery.forEach((item, index) => {
            if (item.url && item.url.startsWith('/images/projects/')) {
                const localPath = item.url.replace('/images/projects/', '');
                const cdnUrl = urlMappings[localPath];
                if (cdnUrl) {
                    content.gallery[index].url = cdnUrl;
                    updated = true;
                    console.log(`  Updated gallery[${index}]: ${path.basename(cdnUrl)}`);
                }
            }
        });
    }

    if (updated) {
        fs.writeFileSync(jsonPath, JSON.stringify(content, null, 2));
        console.log(`✅ Updated: ${projectFile}`);
    } else {
        console.log(`ℹ️  No changes needed: ${projectFile}`);
    }
};

const main = async () => {
    if (!BUNNY_STORAGE_PASSWORD) {
        console.error('❌ BUNNY_STORAGE_PASSWORD is not set in .env file');
        process.exit(1);
    }

    console.log('🚀 Starting upload to BunnyCDN...');
    console.log(`📁 Source: ${PROJECTS_DIR}`);
    console.log(`📦 Storage Zone: ${STORAGE_ZONE}`);
    console.log('');

    try {
        await walkDirectory(PROJECTS_DIR);

        console.log('');
        console.log(`✨ Upload complete! ${Object.keys(uploadedFiles).length} files uploaded.`);
        console.log('');

        // Create URL mappings (local path -> CDN URL)
        const urlMappings = {};
        Object.entries(uploadedFiles).forEach(([localPath, cdnUrl]) => {
            const relativePath = path.relative(PROJECTS_DIR, localPath).replace(/\\/g, '/');
            urlMappings[relativePath] = cdnUrl;
        });

        // Save mapping to file for reference
        const mappingFile = path.join(__dirname, 'cdn-url-mappings.json');
        fs.writeFileSync(mappingFile, JSON.stringify(urlMappings, null, 2));
        console.log(`📄 URL mappings saved to: ${mappingFile}`);
        console.log('');

        // Update project JSON files
        console.log('📝 Updating project JSON files...');
        const projectFiles = [
            'coffee-by-altitude.json',
            'garden-city-essentials.json',
            'liebling-wines.json',
            'merchant-ale-house.json',
            'super-burgers.json'
        ];

        projectFiles.forEach(file => {
            console.log(`\nUpdating ${file}:`);
            updateProjectJson(file, urlMappings);
        });

        console.log('');
        console.log('🎉 All done! Your project images are now on the CDN.');
        console.log('');
        console.log('Next steps:');
        console.log('1. Test the projects to ensure images load correctly');
        console.log('2. Commit the updated JSON files');
        console.log('3. Optionally delete /public/images/projects/ to reduce repo size');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

main();
