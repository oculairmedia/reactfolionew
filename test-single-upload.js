const axios = require('axios');
const FormData = require('form-data');

const CMS_URL = 'https://cms2.emmanuelu.com';

async function test() {
  // Login
  const loginRes = await axios.post(CMS_URL + '/api/users/login', {
    email: 'emanuvaderland@gmail.com',
    password: '7beEXKPk93xSD6m'
  });
  
  const token = loginRes.data.token;
  console.log('Logged in, token:', token.substring(0, 20) + '...');
  
  // Download a small image
  const cdnUrl = 'https://oculair.b-cdn.net/cache/images/13a71ce18ea4cd61e90d177cafd64842d8788508.jpg';
  const fileRes = await axios.get(cdnUrl, { responseType: 'arraybuffer' });
  const fileBuffer = Buffer.from(fileRes.data);
  console.log('Downloaded', fileBuffer.length, 'bytes');
  
  // Upload
  const formData = new FormData();
  formData.append('file', fileBuffer, {
    filename: 'test-image.jpg',
    contentType: 'image/jpeg'
  });
  formData.append('alt', 'Test Image');
  
  try {
    const uploadRes = await axios.post(CMS_URL + '/api/media', formData, {
      headers: {
        'Authorization': 'JWT ' + token,
        ...formData.getHeaders()
      },
      maxBodyLength: Infinity
    });
    console.log('✅ Upload successful:', uploadRes.data);
  } catch (error) {
    console.error('❌ Upload failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

test().catch(console.error);
