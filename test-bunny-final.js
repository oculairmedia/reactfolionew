// Test with storage password as AccessKey (correct for Storage API)
const https = require('https');

const STORAGE_ZONE = 'oculair';
const STORAGE_PASSWORD = '24aa49d8-e029-46b6-b7288d932241-be07-4c73'; // This is the AccessKey for Storage API
const PULL_ZONE_URL = 'https://oculair.b-cdn.net';
const STORAGE_API_HOST = 'la.storage.bunnycdn.com';

console.log('Testing BunnyCDN Connection with Storage Password...');
console.log(`Storage Zone: ${STORAGE_ZONE}`);
console.log(`Storage API: ${STORAGE_API_HOST}`);

const testData = Buffer.from('BunnyCDN test - ' + new Date().toISOString());
const filename = `test-${Date.now()}.txt`;
const uploadPath = `/${STORAGE_ZONE}/media/${filename}`;

const uploadOptions = {
  hostname: STORAGE_API_HOST,
  port: 443,
  path: uploadPath,
  method: 'PUT',
  headers: {
    'AccessKey': STORAGE_PASSWORD,
    'Content-Type': 'text/plain',
    'Content-Length': testData.length,
  }
};

console.log(`\nUploading: ${uploadPath}`);

const uploadReq = https.request(uploadOptions, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    if (res.statusCode === 201 || res.statusCode === 200) {
      console.log('✅ Upload successful!');
      const cdnUrl = `${PULL_ZONE_URL}/media/${filename}`;
      console.log(`CDN URL: ${cdnUrl}`);
      
      setTimeout(() => {
        https.get(cdnUrl, (getRes) => {
          console.log(`\nCDN Status: ${getRes.statusCode}`);
          if (getRes.statusCode === 200) {
            console.log('✅ File accessible!');
          }
          
          // Cleanup
          const delOpts = {
            hostname: STORAGE_API_HOST,
            path: uploadPath,
            method: 'DELETE',
            headers: { 'AccessKey': STORAGE_PASSWORD }
          };
          
          https.request(delOpts, (delRes) => {
            console.log(`\nDelete Status: ${delRes.statusCode}`);
            console.log('✅ Test complete! BunnyCDN is ready.');
          }).end();
        }).on('error', console.error);
      }, 2000);
    } else {
      console.log('❌ Failed:', body);
    }
  });
});

uploadReq.on('error', console.error);
uploadReq.write(testData);
uploadReq.end();
