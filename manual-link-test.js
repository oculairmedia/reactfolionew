const CMS_URL = 'http://192.168.50.90:3006';

async function main() {
  // Auth
  const loginRes = await fetch(`${CMS_URL}/api/users/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      email: 'emanuvaderland@gmail.com',
      password: '7beEXKPk93xSD6m'
    })
  });
  const {token} = await loginRes.json();
  console.log('✅ Authenticated\n');
  
  // Get media list
  const mediaRes = await fetch(`${CMS_URL}/api/media?limit=100`, {
    headers: {'Authorization': `JWT ${token}`}
  });
  const mediaData = await mediaRes.json();
  const allMedia = mediaData.docs;
  console.log(`📦 Found ${allMedia.length} media files\n`);
  
  // Manual mappings (portfolio_id -> media alt text)
  const mappings = {
    'coffee-by-altitude': 'Coffee By Altitude',
    'super-burgers': 'Super Burgers Fries',
    'merchant-ale-house': 'Merchant Ale House',
    'liebling-wines': 'Liebling Wines',
    'garden-city-essentials': 'Garden City Essentials'
  };
  
  for (const [portfolioId, mediaKeyword] of Object.entries(mappings)) {
    const media = allMedia.find(m => 
      (m.alt || m.filename || '').toLowerCase().includes(mediaKeyword.toLowerCase())
    );
    
    if (!media) {
      console.log(`⚠️  ${portfolioId}: No media found for "${mediaKeyword}"`);
      continue;
    }
    
    console.log(`🔗 Linking ${portfolioId} -> ${media.alt} (${media.id})`);
    
    const updateRes = await fetch(`${CMS_URL}/api/portfolio/${portfolioId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${token}`
      },
      body: JSON.stringify({
        featuredImage: media.id,
        img: `${CMS_URL}/media/${media.filename}` // Also update legacy img field
      })
    });
    
    if (updateRes.ok) {
      console.log(`   ✅ Updated\n`);
    } else {
      const error = await updateRes.text();
      console.log(`   ❌ Error: ${error}\n`);
    }
    
    await new Promise(r => setTimeout(r, 300));
  }
}

main();
