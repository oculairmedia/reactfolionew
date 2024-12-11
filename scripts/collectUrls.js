const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Regular expressions for different types of URLs
const URL_PATTERNS = [
    // Environment variable based URLs
    /\$\{process\.env\.REACT_APP_BUNNY_CDN_URL\}\/\$\{process\.env\.REACT_APP_BUNNY_STORAGE_ZONE\}\/[^`'"}\s]+/g,
    // Direct URLs
    /https?:\/\/[^"`'\s]+\/[^"`'\s]+(\.[^"`'\s]+)?/gi
];

// File extensions to search
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.html', '.css'];

// Function to check if a file should be processed
const shouldProcessFile = (filePath) => {
    const ext = path.extname(filePath);
    return FILE_EXTENSIONS.includes(ext) && !filePath.includes('node_modules');
};

// Function to extract URLs from a file
const extractUrlsFromFile = (filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const urls = new Set();

        URL_PATTERNS.forEach(pattern => {
            const matches = content.match(pattern) || [];
            matches.forEach(match => {
                // Clean up the match if it's a src attribute
                if (match.startsWith('src=')) {
                    match = match.replace(/^src=["'`]|["'`]$/g, '');
                }
                urls.add(match);
            });
        });

        if (urls.size > 0) {
            console.log(`\nFile: ${path.relative(process.cwd(), filePath)}`);
            urls.forEach(url => console.log(`  - ${url}`));
        }

        return Array.from(urls);
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error.message);
        return [];
    }
};

// Function to walk through directory
const walkDirectory = (dir, urlCollection = new Set()) => {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && !file.includes('node_modules')) {
            walkDirectory(filePath, urlCollection);
        } else if (stat.isFile() && shouldProcessFile(filePath)) {
            const urls = extractUrlsFromFile(filePath);
            urls.forEach(url => urlCollection.add(url));
        }
    });

    return urlCollection;
};

// Main execution
const main = () => {
    console.log('Collecting URLs from project files...\n');
    
    const srcDir = path.join(process.cwd(), 'src');
    const allUrls = walkDirectory(srcDir);

    console.log('\nSummary:');
    console.log('Total unique URLs found:', allUrls.size);
    
    // Group URLs by type
    const videoUrls = new Set();
    const imageUrls = new Set();
    const otherUrls = new Set();

    allUrls.forEach(url => {
        const lowercaseUrl = url.toLowerCase();
        if (lowercaseUrl.match(/\.(mp4|webm|ogg|avc|hevc)($|\?)/)) {
            videoUrls.add(url);
        } else if (lowercaseUrl.match(/\.(jpg|jpeg|png|gif|svg|webp)($|\?)/)) {
            imageUrls.add(url);
        } else {
            otherUrls.add(url);
        }
    });

    console.log('\nVideo URLs:', videoUrls.size);
    videoUrls.forEach(url => console.log(`  - ${url}`));

    console.log('\nImage URLs:', imageUrls.size);
    imageUrls.forEach(url => console.log(`  - ${url}`));

    console.log('\nOther URLs:', otherUrls.size);
    otherUrls.forEach(url => console.log(`  - ${url}`));
};

main();
