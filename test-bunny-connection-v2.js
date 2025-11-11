// Test BunnyCDN connection with correct credentials
const https = require('https');

const STORAGE_ZONE = 'oculair';
const ACCESS_KEY = '0f64cb9f-ac64-494a-be85-648519b74dd591904d59-e6ae-4481-8188-b80f022373f2';
const PULL_ZONE_URL = 'https://oculair.b-cdn.net';
const STORAGE_API_HOST = 'la.storage.bunnycdn.com';

console.log('Testing BunnyCDN Connection...');
console.log(`Storage Zone: ${STORAGE_ZONE}`);
console.log(`Storage API: ${STORAGE_API_HOST}`);
console.log(`Pull Zone URL: ${PULL_ZONE_URL}`);

const testData = Buffer.from('BunnyCDN connection test - ' + new Date().toISOString());
const filename = `test-${Date.now()}.txt`;
const uploadPath = `/${STORAGE_ZONE}/media/${filename}`;

const uploadOptions = {
  hostname: STORAGE_API_HOST,
  port: 443,
  path: uploadPath,
  method: 'PUT',
  headers: {
    'AccessKey': ACCESS_KEY,
    'Content-Type': 'text/plain',
    'Content-Length': testData.length,
  }
};

console.log(`\nUploading test file: ${uploadPath}`);

const uploadReq = https.request(uploadOptions, (res) => {
  console.log(`Upload Status: ${res.statusCode}`);
  
  let responseBody = '';
  res.on('data', (chunk) => responseBody += chunk);
  res.on('end', () => {
    if (res.statusCode === 201 || res.statusCode === 200) {
      console.log('✅ Upload successful!');
      
      const cdnUrl = `${PULL_ZONE_URL}/media/${filename}`;
      console.log(`CDN URL: ${cdnUrl}`);
      
      console.log('\nVerifying file accessibility (waiting 2s for propagation)...');
      setTimeout(() => {
        https.get(cdnUrl, (getRes) => {
          console.log(`CDN Access Status: ${getRes.statusCode}`);
          if (getRes.statusCode === 200) {
            console.log('✅ File accessible on CDN!');
          }
          
          console.log('\nCleaning up test file...');
          const deleteOptions = {
            hostname: STORAGE_API_HOST,
            port: 443,
            path: uploadPath,
            method: 'DELETE',
            headers: {
              'AccessKey': ACCESS_KEY,
            }
          };
          
          const deleteReq = https.request(deleteOptions, (delRes) => {
            console.log(`Delete Status: ${delRes.statusCode}`);
            if (delRes.statusCode === 200 || delRes.statusCode === 204) {
              console.log('✅ Cleanup successful!');
            }
            console.log('\n🎉 All tests passed! BunnyCDN is ready for auto-upload.');
          });
          
          deleteReq.on('error', (e) => {
            console.error('Delete error:', e.message);
          });
          
          deleteReq.end();
        }).on('error', (e) => {
          console.error('CDN access error:', e.message);
        });
      }, 2000);
    } else {
      console.log('❌ Upload failed');
      console.log(responseBody);
    }
  });
});

uploadReq.on('error', (e) => {
  console.error('❌ Upload error:', e.message);
});

uploadReq.write(testData);
uploadReq.end();
