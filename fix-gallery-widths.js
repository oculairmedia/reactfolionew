const CMS_URL = 'http://192.168.50.90:3006';
const PROJECTS = ['coffee-by-altitude', 'merchant-ale-house', 'liebling-wines', 'garden-city-essentials'];

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
  
  for (const projectId of PROJECTS) {
    console.log(`🔧 Fixing ${projectId}...`);
    
    // Clear gallery
    const response = await fetch(`${CMS_URL}/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${token}`
      },
      body: JSON.stringify({ gallery: [] })
    });
    
    if (response.ok) {
      console.log(`   ✅ Gallery cleared\n`);
    } else {
      console.log(`   ❌ Failed\n`);
    }
    
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log('✅ Done! Re-running migration...\n');
}

main().then(() => {
  require('./final-migration.js');
});
