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
  
  // Get media
  const mediaRes = await fetch(`${CMS_URL}/api/media?limit=100`, {
    headers: {'Authorization': `JWT ${token}`}
  });
  const mediaData = await mediaRes.json();
  const allMedia = mediaData.docs;
  
  // Manual mappings based on hash filenames
  const mappings = {
    'couple-ish': 'f6d1f7b99f9131662c73d852d3b85ff78b6cb3ed',
    'branton': 'cd3938b537ae6d5b28caf0c6863f6f07187f3a45',
    'binmetrics': 'cd3938b537ae6d5b28caf0c6863f6f07187f3a45',
    'aquatic-resonance': 'a464a6d79ac0a23ba1e3dca4ed8f836534ed77fd',
    'voices-unheard': 'a464a6d79ac0a23ba1e3dca4ed8f836534ed77fd'
  };
  
  for (const [portfolioId, hash] of Object.entries(mappings)) {
    const media = allMedia.find(m => 
      m.filename && m.filename.includes(hash)
    );
    
    if (!media) {
      console.log(`⚠️  ${portfolioId}: No media found for hash ${hash.substring(0, 20)}...`);
      continue;
    }
    
    console.log(`🔗 Linking ${portfolioId} -> ${media.filename} (${media.id})`);
    
    const updateRes = await fetch(`${CMS_URL}/api/portfolio/${portfolioId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${token}`
      },
      body: JSON.stringify({
        featuredImage: media.id,
        img: `${CMS_URL}/media/${media.filename}`
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
  
  console.log('✅ All done!');
}

main();
