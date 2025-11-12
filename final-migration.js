#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CMS_URL = 'http://192.168.50.90:3006';
const PAYLOAD_EMAIL = 'emanuvaderland@gmail.com';
const PAYLOAD_PASSWORD = process.env.PAYLOAD_PASSWORD || '7beEXKPk93xSD6m';

let authToken = null;

async function authenticate() {
  const response = await fetch(`${CMS_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: PAYLOAD_EMAIL, password: PAYLOAD_PASSWORD }),
  });
  const data = await response.json();
  authToken = data.token;
  console.log('✅ Authenticated\n');
}

// Load extracted content
const extractedContent = JSON.parse(fs.readFileSync('./extracted-project-content.json', 'utf-8'));

// Add manually extracted projects
const manualContent = {
  'voices-unheard': {
    title: 'Voices Unheard: The Church and Marginalized Communities',
    overview: 'Voices Unheard: The Church and Marginalized Communities is a video collaboration that is part of the Inter/Access IA 360° Showcase Exhibition. This project uses AI-generated imagery to create a new "church" for Indigenous, Queer, and POC folks, bringing together technology, art, and social commentary.',
    process: `This project was a collaborative effort by Nyle Migiizi Johnston, Nigel Nolan, and Emmanuel Umukoro - members of Highness Generates, a division of Highness Global Inc. The process began with gathering datasets from Johnston's and Nolan's artwork, which Umukoro then used to create AI-generated imagery.

The objective during the creative process was to create a machine-generated collaboration of Johnston's and Nolan's work while employing Umukoro's extensive knowledge in animation and digital media. This unique approach allowed for a blend of traditional artistic styles with cutting-edge AI technology.

The team worked on creating a maximalist vision that incorporates patterns, colours, plant life, astronomy, and architecture into a new concept of a "church" for marginalized communities. This process involved multiple iterations of AI-generated imagery, careful curation, and skillful animation to bring the static images to life.`,
    outcome: `The final video brings together a maximalist vision of patterns, colours, plant life, astronomy, and architecture into a new "church" for Indigenous, Queer, and POC folks. Voices Unheard: The Church and Marginalized Communities layers imagery of the future and thoughts from our past to bring the viewer into a space to contemplate new modes of creation, awareness, and unity.

This project showcases the potential of AI in creating immersive, thought-provoking art that addresses important social issues. It challenges traditional notions of religious spaces and invites viewers to consider more inclusive, diverse spiritual environments.`,
    heroType: 'video',
    heroVideo: 'https://oculair.b-cdn.net/api/v1/videos/bfbad3bf0b671badf4eb75634e9f15407ffd60ad/3rjei659/hevc',
    metadata: {
      date: 'November 2023',
      exhibition: 'Inter/Access IA 360° Showcase',
      curators: 'Kyle Duffield and Terry Anastasiadis',
      collaborators: 'Nyle Migiizi Johnston, Nigel Nolan, Emmanuel Umukoro',
      technologies: 'AI-generated imagery, Digital Animation'
    }
  },
  'couple-ish': {
    title: 'Couple-Ish',
    overview: 'Couple-ish is a new Canadian produced LGBTQ web series. It\'s about Dee, a bisexual, non-binary Canadian illustrator, who finds themselves locked into a lease they can\'t afford. With the help of younger sister Amy, Dee thinks they find the perfect new roommate in Rachel, a queer British bartender.',
    process: 'The challenge here was to create promotional posters that would convey the characters\' unique personalities. We also made the posters complementary to increase collectability.',
    heroType: 'image',
    heroImage: 'https://oculair.b-cdn.net/cache/images/28690189625a7d5ecf17b8a213a41e053b848ab9.jpg',
    metadata: {
      date: 'February 2024',
      client: 'Couple-Ish Web Series',
      role: 'Photography, Digital Illustration, Poster Design'
    }
  },
  'binmetrics': {
    title: 'Binmetrics',
    overview: 'Brand identity and marketing design for Binmetrics, a startup providing business intelligence solutions.',
    process: 'Created a comprehensive brand identity including logo design, color palette, typography system, and marketing materials.',
    heroType: 'image',
    heroImage: 'https://oculair.b-cdn.net/cache/images/cd3938b537ae6d5b28caf0c6863f6f07187f3a45.jpg'
  },
  '3m-vhb-tapes': {
    title: '3M VHB Tapes',
    overview: 'Product photography and visual design for 3M VHB Tapes marketing campaign.',
    process: 'Created high-quality product photography and supporting visual materials to showcase the strength and versatility of 3M VHB Tapes.',
    heroType: 'image',
    heroImage: 'https://oculair.b-cdn.net/cache/images/b1d7b284701359f4d25a324dd3ac3068023b3767.jpg'
  }
};

// Combine all content
const allContent = { ...extractedContent, ...manualContent };

async function updateProject(projectId, data) {
  const response = await fetch(`${CMS_URL}/api/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `JWT ${authToken}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  
  return await response.json();
}

async function migrateProject(projectId, content) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📄 ${projectId.toUpperCase()}`);
  console.log('='.repeat(70));
  
  const sections = [];
  
  // Add Overview section
  if (content.overview) {
    sections.push({
      title: 'Overview',
      content: content.overview,
      layout: 'two-column'
    });
  }
  
  // Add Process section
  if (content.process) {
    sections.push({
      title: 'The Process',
      content: content.process,
      layout: 'two-column'
    });
  }
  
  // Add Outcome section (for Voices Unheard)
  if (content.outcome) {
    sections.push({
      title: 'The Outcome',
      content: content.outcome,
      layout: 'two-column'
    });
  }
  
  // Build update data
  const updateData = {
    title: content.title,
    subtitle: content.overview ? content.overview.substring(0, 200) + '...' : '',
    sections: sections,
    metadata: content.metadata || {
      date: content.date || '',
      client: content.client || '',
      role: content.role || ''
    }
  };
  
  // Set hero
  if (content.heroType === 'video' && content.heroVideo) {
    updateData.hero = {
      type: 'video',
      video: content.heroVideo,
      alt: content.title
    };
    console.log(`   🎬 Video hero set`);
  } else if (content.heroImage) {
    updateData.hero = {
      type: 'image',
      image: content.heroImage || content.heroType,
      alt: content.title
    };
    console.log(`   🖼️  Image hero set`);
  }
  
  console.log(`   📝 Sections: ${sections.length}`);
  sections.forEach(s => console.log(`      - ${s.title}`));
  
  // Add testimonial if exists
  if (content.testimonial) {
    console.log(`   💬 Testimonial: Yes`);
    // Note: Testimonial field might need to be added to schema
  }
  
  // Add services if exists
  if (content.services) {
    console.log(`   🛠️  Services: ${content.services.length} items`);
    // Note: Services field might need to be added to schema  
  }
  
  try {
    await updateProject(projectId, updateData);
    console.log(`   ✅ UPDATED SUCCESSFULLY`);
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message.substring(0, 80)}...`);
  }
  
  await new Promise(r => setTimeout(r, 500));
}

async function main() {
  console.log('🚀 FINAL PROJECT CONTENT MIGRATION');
  console.log('=' .repeat(70));
  console.log(`Total projects: ${Object.keys(allContent).length}`);
  console.log('='.repeat(70));
  
  await authenticate();
  
  for (const [projectId, content] of Object.entries(allContent)) {
    await migrateProject(projectId, content);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ MIGRATION COMPLETE!');
  console.log('='.repeat(70));
  console.log('\nNext steps:');
  console.log('1. Review at: ' + CMS_URL + '/admin/collections/projects');
  console.log('2. npm run build');
  console.log('3. git add -A && git commit -m "Complete project content migration"');
  console.log('4. git push origin master');
}

main();
