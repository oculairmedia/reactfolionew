#!/usr/bin/env node

/**
 * Update all Couple-ish sections to accurately reflect photography and marketing work
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

async function updateCoupleishSections() {
  console.log('=== UPDATING COUPLE-ISH PROJECT SECTIONS ===\n');
  
  try {
    const response = await axios.get(`${API_URL}/projects?where[id][equals]=couple-ish&limit=1`);
    const project = response.data.docs[0];
    
    if (project) {
      console.log('Found project:', project.title);
      console.log('Updating all sections to reflect photography and marketing work...\n');
      
      // Create comprehensive sections about the photography and marketing work
      const sections = [
        {
          title: 'Overview',
          content: `Couple-ish is a groundbreaking Canadian LGBTQ+ web series created by K Alexander that ran from 2015-2017, featuring 44 episodes across two seasons. The series follows Dee, a non-binary illustrator, and Rachel, a British bartender, as they navigate a fake relationship for immigration purposes. As the principal unit still photographer and marketing designer for the production, I was responsible for capturing the essence of this innovative series through photography and creating all visual marketing materials that helped promote the show to its audience.`
        },
        {
          title: 'The Photography',
          content: `Working as the unit still photographer on set required capturing both the intimate character moments that defined the series and the behind-the-scenes energy of the production. My approach focused on documenting the authentic chemistry between the cast members while maintaining the show's distinctive visual style. I shot hundreds of stills during production, providing the creative team with a comprehensive library of images for promotional use, press releases, and social media campaigns. Each photograph needed to reflect the show's unique blend of comedy and drama while celebrating its LGBTQ+ themes.`
        },
        {
          title: 'Marketing Design',
          content: `The marketing campaign for Couple-ish required creating a cohesive visual identity that would resonate with the LGBTQ+ community and broader audiences. I designed character posters that highlighted each cast member's unique personality, making them complementary pieces that fans would want to collect. The poster series used bold colors and contemporary typography to reflect the show's modern take on relationships and identity. Additionally, I created social media assets, web banners, and promotional materials that maintained visual consistency across all platforms.`
        },
        {
          title: 'The Impact',
          content: `Couple-ish became a significant milestone in LGBTQ+ web series representation, with the photography and marketing materials playing a crucial role in building its audience. The show was nominated for a Streamy Award in 2016 and successfully crowdfunded both seasons through Kickstarter and Indiegogo campaigns. The promotional imagery I created helped the series reach nearly 800 backers and raise over $45,000 USD for its second season. The visual assets continue to serve as documentation of this important moment in Canadian LGBTQ+ media history.`
        }
      ];
      
      const updates = {
        sections: sections
      };
      
      console.log('New sections:');
      sections.forEach((section, i) => {
        console.log(`${i + 1}. ${section.title}`);
      });
      
      await axios.patch(
        `${API_URL}/projects/${project.id}`,
        updates,
        { headers: getHeaders() }
      );
      
      console.log('\n✅ Successfully updated all Couple-ish sections!');
      console.log('\nThe project page now accurately reflects:');
      console.log('• Your role as unit still photographer');
      console.log('• Your work creating marketing materials and posters');
      console.log('• The photography process and approach');
      console.log('• The marketing design strategy');
      console.log('• The impact of your visual work on the series success');
      
    } else {
      console.log('❌ Project not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🚀 Updating Couple-ish project sections...\n');
  await login();
  await updateCoupleishSections();
  console.log('\n🎉 Complete!');
}

main().catch(console.error);
