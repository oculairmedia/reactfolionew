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
  
  // Get all portfolio items
  const portfolioRes = await fetch(`${CMS_URL}/api/portfolio?limit=100`, {
    headers: {'Authorization': `JWT ${token}`}
  });
  const portfolioData = await portfolioRes.json();
  const items = portfolioData.docs;
  
  console.log(`📋 Found ${items.length} portfolio items\n`);
  
  for (const item of items) {
    const currentLink = item.link || '';
    const correctLink = `/projects/${item.id}`;
    
    if (currentLink === correctLink) {
      console.log(`✓ ${item.title}: Already correct`);
      continue;
    }
    
    console.log(`🔧 ${item.title}:`);
    console.log(`   From: ${currentLink}`);
    console.log(`   To:   ${correctLink}`);
    
    const updateRes = await fetch(`${CMS_URL}/api/portfolio/${item.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${token}`
      },
      body: JSON.stringify({
        link: correctLink
      })
    });
    
    if (updateRes.ok) {
      console.log(`   ✅ Updated\n`);
    } else {
      const error = await updateRes.text();
      console.log(`   ❌ Error: ${error}\n`);
    }
    
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log('✅ All portfolio links fixed!');
}

main();
