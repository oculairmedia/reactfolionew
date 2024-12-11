const fs = require('fs');
const path = require('path');
const https = require('https');

const mediaUrls = [
    "https://files.oculair.ca/api/v1/videos/29d980a5d2fff954196daf60232e7072ebac9752/3rjei659/avc",
    "https://files.oculair.ca/api/v1/videos/bfbad3bf0b671badf4eb75634e9f15407ffd60ad/3rjei659/hevc",
    "https://files.oculair.ca/api/v1/videos/29d980a5d2fff954196daf60232e7072ebac9752/3rjei659/avc",
    "https://files.oculair.ca/api/v1/videos/332b28a6113e401b77b6894d3254766d15c6a9ac/3rjei659/avc",
    "https://files.oculair.ca/api/v1/videos/f200bfc144e110dc4821384c82dca7d6fbd67c66/3rjei659/avc"
];

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest);
            reject(err.message);
        });
    });
}

function downloadAllFiles() {
    const downloadPromises = mediaUrls.map((url, index) => {
        const fileName = `video_${index + 1}.mp4`;
        const dest = path.join(__dirname, 'videos', fileName);
        return downloadFile(url, dest);
    });

    Promise.all(downloadPromises)
        .then(() => {
            console.log('All files downloaded successfully.');
        })
        .catch((error) => {
            console.error('Error downloading files:', error);
        });
}

// Ensure the videos directory exists
const videosDir = path.join(__dirname, 'videos');
if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir);
}

downloadAllFiles();
