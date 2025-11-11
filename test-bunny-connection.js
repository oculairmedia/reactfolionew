// Quick test of BunnyCDN connection
const https = require('https');

const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || 'oculair';
const ACCESS_KEY = process.env.BUNNY_ACCESS_KEY || '24aa49d8-e029-46b6-b7288d932241-be07-4c73';
const PULL_ZONE_URL = process.env.BUNNY_PULL_ZONE_URL || 'https://oculair.b-cdn.net';

console.log('Testing BunnyCDN Connection...');
console.log(`Storage Zone: ${STORAGE_ZONE}`);
console.log(`Pull Zone URL: ${PULL_ZONE_URL}`);

// Test 1: Upload a small test file
const testData = Buffer.from('BunnyCDN connection test - ' + new Date().toISOString());
const filename = `test-${Date.now()}.txt`;
const uploadPath = `/${STORAGE_ZONE}/media/${filename}`;

const uploadOptions = {
  hostname: 'storage.bunnycdn.com',
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
  
  if (res.statusCode === 201 || res.statusCode === 200) {
    console.log('✅ Upload successful!');
    
    const cdnUrl = `${PULL_ZONE_URL}/media/${filename}`;
    console.log(`CDN URL: ${cdnUrl}`);
    
    // Test 2: Verify file is accessible
    console.log('\nVerifying file accessibility...');
    setTimeout(() => {
      https.get(cdnUrl, (getRes) => {
        console.log(`CDN Access Status: ${getRes.statusCode}`);
        if (getRes.statusCode === 200) {
          console.log('✅ File accessible on CDN!');
        }
        
        // Test 3: Delete test file
        console.log('\nCleaning up test file...');
        const deleteOptions = {
          hostname: 'storage.bunnycdn.com',
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
          console.log('\n✅ All tests passed! BunnyCDN is ready.');
        });
        
        deleteReq.on('error', (e) => {
          console.error('Delete error:', e.message);
        });
        
        deleteReq.end();
      });
    }, 2000); // Wait 2 seconds for CDN propagation
  } else {
    console.log('❌ Upload failed');
    res.on('data', (chunk) => console.log(chunk.toString()));
  }
});

uploadReq.on('error', (e) => {
  console.error('❌ Upload error:', e.message);
});

uploadReq.write(testData);
uploadReq.end();
