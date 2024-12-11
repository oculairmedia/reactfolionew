const fs = require('fs');
const path = require('path');
const https = require('https');

// List of URLs to download
const urls = [
    'https://files.oculair.ca/api/v1/videos/332b28a6113e401b77b6894d3254766d15c6a9ac/3rjei659/avc',
    'https://files.oculair.ca/api/v1/videos/f200bfc144e110dc4821384c82dca7d6fbd67c66/3rjei659/avc',
    'https://files.oculair.ca/api/v1/videos/29d980a5d2fff954196daf60232e7072ebac9752/3rjei659/avc',
    'https://files.oculair.ca/api/v1/videos/bfbad3bf0b671badf4eb75634e9f15407ffd60ad/3rjei659/hevc',
    'https://files.oculair.ca/api/v1/videos/ab378b5c663d95304309a7a814fcae6997042c36/3rjei659/avc'
];

// Function to download a file
function downloadFile(url) {
    const urlObj = new URL(url);
    // Get the full path from the URL (excluding the domain)
    const fullPath = urlObj.pathname;
    // Remove the initial slash if present
    const relativePath = fullPath.startsWith('/') ? fullPath.slice(1) : fullPath;
    const localPath = path.join(__dirname, '../downloads', relativePath);
    const dir = path.dirname(localPath);

    // Create directories if they don't exist
    fs.mkdirSync(dir, { recursive: true });

    // Download the file
    const file = fs.createWriteStream(localPath);
    https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded: ${localPath}`);
        });
    }).on('error', (err) => {
        fs.unlink(localPath, () => {});
        console.error(`Error downloading ${url}: ${err.message}`);
    });
}

// Download all files
console.log('Starting downloads...');
urls.forEach(downloadFile);
