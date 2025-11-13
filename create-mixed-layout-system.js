#!/usr/bin/env node

/**
 * Create a flexible mixed media layout system for Couple-ish
 * Allows images to be interspersed with content sections
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

async function updateCoupleishWithMixedLayout() {
  console.log('=== CREATING MIXED MEDIA LAYOUT FOR COUPLE-ISH ===\n');
  
  try {
    const response = await axios.get(`${API_URL}/projects?where[id][equals]=couple-ish&limit=1`);
    const project = response.data.docs[0];
    
    if (project) {
      console.log('Found project:', project.title);
      console.log('Creating editorial-style layout with mixed media...\n');
      
      // Get gallery images to mix in
      const galleryImages = project.gallery || [];
      
      // Create sections with mixed media layout
      // Each section can have: layout type, content, and optional image
      const sections = [
        {
          title: 'The Series',
          layout: 'image-left', // Image on left, text on right
          content: `**Couple-ish** was a groundbreaking Canadian LGBTQ+ web series that aired from 2015-2017, featuring 44 episodes across two seasons. Created by K Alexander, the series followed Dee, a non-binary illustrator, and Rachel, a British bartender, navigating a fake relationship for immigration purposes.

The show became notable for its authentic representation of LGBTQ+ relationships and non-binary characters at a time when such visibility was rare in web series.`,
          image: galleryImages[0] || null
        },
        {
          title: 'My Role as Photographer',
          layout: 'image-right', // Image on right, text on left
          content: `As the **principal unit still photographer**, I was responsible for documenting every aspect of this groundbreaking production. My work involved:

• On-set photography during all 44 episodes
• Behind-the-scenes documentation of the production process
• Promotional portrait sessions with the full cast
• Creating a comprehensive visual library for press and marketing

The role required being embedded with the production team, capturing both scripted moments and candid interactions that revealed the genuine chemistry between cast members.`,
          image: galleryImages[1] || null
        },
        {
          title: 'Marketing & Design',
          layout: 'full-width', // Full width text, no image
          content: `Beyond photography, I created the complete visual identity for the series. The marketing campaign needed to resonate with LGBTQ+ audiences while appealing to broader viewership. I designed character posters that highlighted each cast member's unique personality, making them complementary pieces that fans would want to collect.

The poster series used bold colors and contemporary typography to reflect the show's modern take on relationships and identity. These materials became crucial in building the series' visual brand across all platforms.`
        },
        {
          title: 'Behind the Lens',
          layout: 'image-left', // Image on left, text on right
          content: `Working on Couple-ish meant capturing hundreds of stills per episode. Each image needed to work for multiple purposes: social media, press releases, promotional materials, and fan engagement.

I approached the photography with a documentary mindset, using natural lighting to maintain the intimate, authentic feel of the series. The challenge was maintaining visual consistency across two seasons while allowing the style to evolve with the characters' journeys.`,
          image: galleryImages[2] || null
        },
        {
          title: 'Visual Impact',
          layout: 'image-right', // Image on right, text on left  
          content: `The photography and design work played a crucial role in the series' success. The compelling visual campaign helped attract nearly 800 backers across crowdfunding campaigns, raising over $45,000 USD for the second season.

Professional stills were featured in numerous LGBTQ+ publications and mainstream media, expanding the show's reach. The series earned a Streamy Award nomination in 2016, with the visual materials becoming an important part of its legacy.`,
          image: galleryImages[3] || null
        },
        {
          title: 'Legacy & Documentation',
          layout: 'full-width-with-image', // Full width text with large image below
          content: `Beyond the immediate marketing needs, this photography now serves as historical documentation of an important moment in Canadian LGBTQ+ media. The images capture not just the final product, but the creative process and community that made Couple-ish possible.

Each photograph represents a moment in time when web series were pushing boundaries and creating space for stories that mainstream media wasn't telling. This work stands as a testament to the power of independent, community-supported storytelling.`,
          image: galleryImages[4] || null
        }
      ];
      
      const updates = {
        sections: sections,
        gallery: galleryImages // Keep original gallery
      };
      
      console.log('New mixed media layout structure:');
      sections.forEach((section, i) => {
        const hasImage = section.image ? '✓ with image' : '✗ no image';
        console.log(`${i + 1}. ${section.title} - Layout: ${section.layout} ${hasImage}`);
      });
      
      await axios.patch(
        `${API_URL}/projects/${project.id}`,
        updates,
        { headers: getHeaders() }
      );
      
      console.log('\n✅ Successfully created mixed media layout!');
      console.log('\nLayout patterns created:');
      console.log('• Image-left: Image on left, text wraps on right');
      console.log('• Image-right: Image on right, text wraps on left');
      console.log('• Full-width: Text only, no image');
      console.log('• Full-width-with-image: Text above, large image below');
      console.log('\nThis creates a magazine-style editorial flow!');
      
    } else {
      console.log('❌ Project not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🚀 Creating mixed media layout system...\n');
  await login();
  await updateCoupleishWithMixedLayout();
  console.log('\n🎉 Complete! Now update DynamicProjectPage component to render these layouts.');
}

main().catch(console.error);
