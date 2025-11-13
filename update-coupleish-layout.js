#!/usr/bin/env node

/**
 * Update Couple-ish project with a new layout variant
 * More dynamic and visually interesting content structure
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

async function updateCoupleishLayout() {
  console.log('=== CREATING NEW COUPLE-ISH LAYOUT VARIANT ===\n');
  
  try {
    const response = await axios.get(`${API_URL}/projects?where[id][equals]=couple-ish&limit=1`);
    const project = response.data.docs[0];
    
    if (project) {
      console.log('Found project:', project.title);
      console.log('Creating new layout variant...\n');
      
      // Create a more dynamic layout with mixed full-width and two-column sections
      const sections = [
        {
          title: 'The Series',
          layout: 'two-column',  // Two-column layout for better visual hierarchy
          content: `**Couple-ish** was a groundbreaking Canadian LGBTQ+ web series that aired from 2015-2017, featuring 44 episodes across two seasons. Created by K Alexander, the series followed Dee, a non-binary illustrator, and Rachel, a British bartender, navigating a fake relationship for immigration purposes.

The show was notable for its authentic representation of LGBTQ+ relationships and non-binary characters at a time when such visibility was rare in web series. It successfully crowdfunded both seasons, raising nearly $45,000 USD and earning a Streamy Award nomination in 2016.`
        },
        {
          title: 'My Role',
          layout: 'two-column',  // Two-column for cleaner presentation
          content: `As the **principal unit still photographer and marketing designer**, I was responsible for capturing the visual essence of this innovative series through:

**Photography**
- On-set unit still photography for all 44 episodes
- Behind-the-scenes documentation
- Promotional portrait sessions with the cast
- Creating a comprehensive image library for press and social media

**Marketing Design**
- Complete visual identity for the series
- Character poster series (collectible designs)
- Social media assets and web banners
- Press kit materials and promotional graphics`
        },
        {
          title: 'Visual Approach',
          layout: 'full-width',  // Full-width for impact statement
          content: `My visual approach balanced the show's comedy and drama elements while celebrating its LGBTQ+ themes. I focused on capturing authentic moments between cast members, using natural lighting to emphasize the intimate, documentary-style feel of the series. The marketing materials used bold, contemporary typography with vibrant colors that reflected the show's fresh perspective on modern relationships.`
        },
        {
          title: 'Behind the Scenes',
          layout: 'two-column',  // Two-column for process details
          content: `Working on Couple-ish meant being embedded with the production team throughout filming. This intimate access allowed me to capture candid moments that revealed the genuine chemistry between cast members. 

I shot hundreds of stills per episode, providing the creative team with options for every marketing need. The challenge was maintaining consistency across two seasons while allowing the visual style to evolve with the characters' journeys.

Each poster design went through multiple iterations to ensure it captured the personality of the character while maintaining series cohesion. The collectible nature of the posters became a fan favorite, with many backers displaying the complete set.`
        },
        {
          title: 'Campaign Impact',
          layout: 'two-column',  // Two-column for results
          content: `The visual campaign played a crucial role in the series' success:

**Crowdfunding Success**
The compelling imagery helped attract nearly 800 backers across Kickstarter and Indiegogo campaigns, exceeding funding goals for both seasons.

**Media Coverage**
Professional stills were featured in numerous LGBTQ+ publications and mainstream media outlets, helping expand the show's reach beyond its initial audience.

**Community Building**
The marketing materials became rallying points for fans, with poster designs and promotional images widely shared across social media platforms.

**Historical Documentation**
The photography now serves as an important record of this milestone in Canadian LGBTQ+ media representation.`
        }
      ];
      
      // Update with alternating layout gallery configuration
      const galleryConfig = {
        displayStyle: 'mixed',  // Mixed layout for variety
        items: project.gallery || []
      };
      
      const updates = {
        sections: sections,
        gallery: galleryConfig.items
      };
      
      console.log('New layout structure:');
      sections.forEach((section, i) => {
        console.log(`${i + 1}. ${section.title} - Layout: ${section.layout}`);
      });
      
      await axios.patch(
        `${API_URL}/projects/${project.id}`,
        updates,
        { headers: getHeaders() }
      );
      
      console.log('\n✅ Successfully updated Couple-ish layout!');
      console.log('\nLayout improvements:');
      console.log('• Mixed two-column and full-width sections for visual variety');
      console.log('• Better content hierarchy with "The Series" and "My Role" upfront');
      console.log('• Separated photography and design work for clarity');
      console.log('• More detailed behind-the-scenes insights');
      console.log('• Clear impact metrics and results');
      console.log('• Professional yet personal tone throughout');
      
    } else {
      console.log('❌ Project not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🚀 Updating Couple-ish project layout...\n');
  await login();
  await updateCoupleishLayout();
  console.log('\n🎉 Complete! Review the new layout on the live site.');
}

main().catch(console.error);
