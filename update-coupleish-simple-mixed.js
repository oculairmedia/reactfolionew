#!/usr/bin/env node

/**
 * Update Couple-ish with simpler content structure
 * Component will handle mixing images automatically
 */

require('dotenv').config({ path: '.env.payload' });
const axios = require('axios');

const API_BASE = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://192.168.50.90:3006';
const API_URL = `${API_BASE}/api`;

let authToken = null;

async function login() {
  const response = await axios.post(`${API_URL}/users/login`, {
    email: process.env.PAYLOAD_EMAIL,
    password: process.env.PAYLOAD_PASSWORD
  });
  authToken = response.data.token;
  console.log('✅ Authenticated\n');
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `JWT ${authToken}`
  };
}

async function updateCoupleish() {
  console.log('=== UPDATING COUPLE-ISH WITH MIXED LAYOUT ===\n');
  
  try {
    const response = await axios.get(`${API_URL}/projects?where[id][equals]=couple-ish&limit=1`);
    const project = response.data.docs[0];
    
    if (project) {
      console.log('Found project:', project.title);
      
      // Cleaner sections - component will interleave images automatically
      const sections = [
        {
          title: 'The Series',
          content: `**Couple-ish** was a groundbreaking Canadian LGBTQ+ web series that aired from 2015-2017, featuring 44 episodes across two seasons. Created by K Alexander, the series followed Dee, a non-binary illustrator, and Rachel, a British bartender, navigating a fake relationship for immigration purposes.

The show became notable for its authentic representation of LGBTQ+ relationships and non-binary characters at a time when such visibility was rare in web series.`
        },
        {
          title: 'Photography',
          content: `As the **principal unit still photographer**, I documented every aspect of this production across all 44 episodes. My work involved on-set photography, behind-the-scenes documentation, promotional portrait sessions, and creating a comprehensive visual library for press and marketing.

The role required being embedded with the production team, capturing both scripted moments and candid interactions that revealed the genuine chemistry between cast members.`
        },
        {
          title: 'Marketing & Visual Identity',
          content: `Beyond photography, I created the complete visual identity for the series. I designed character posters that highlighted each cast member's unique personality, making them complementary pieces that fans would want to collect.

The poster series used bold colors and contemporary typography to reflect the show's modern take on relationships and identity. These materials became crucial in building the series' visual brand across all platforms.`
        },
        {
          title: 'The Process',
          content: `Working on Couple-ish meant capturing hundreds of stills per episode. Each image needed to work for multiple purposes: social media, press releases, promotional materials, and fan engagement.

I approached the photography with a documentary mindset, using natural lighting to maintain the intimate, authentic feel of the series. The challenge was maintaining visual consistency across two seasons while allowing the style to evolve with the characters' journeys.`
        },
        {
          title: 'Impact',
          content: `The photography and design work played a crucial role in the series' success. The compelling visual campaign helped attract nearly 800 backers across crowdfunding campaigns, raising over $45,000 USD for the second season.

Professional stills were featured in numerous LGBTQ+ publications and mainstream media, expanding the show's reach. The series earned a **Streamy Award nomination in 2016**, with the visual materials becoming an important part of its legacy.`
        }
      ];
      
      const updates = {
        sections: sections
      };
      
      await axios.patch(
        `${API_URL}/projects/${project.id}`,
        updates,
        { headers: getHeaders() }
      );
      
      console.log('\n✅ Updated sections!');
      console.log('📸 Gallery images will be automatically mixed with text');
      console.log('🎨 Component handles the layout pattern\n');
      
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function main() {
  await login();
  await updateCoupleish();
  console.log('🎉 Done!');
}

main().catch(console.error);
