import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { meta } from "../../content_option";
import ProjectPage from "../../components/ProjectPage";

// Import images
import heroImage from "../../assets/scraped/work_garden-city-essentials/garden-city-essentials-after.jpg";
import image1 from "../../assets/scraped/work_garden-city-essentials/garden-city-essentials-2.jpg";
import image2 from "../../assets/scraped/work_garden-city-essentials/garden-city-essentials-3.jpg";
import image3 from "../../assets/scraped/work_garden-city-essentials/garden-city-essentials-4.jpg";
import image4 from "../../assets/scraped/test 1/garden-city-essentials-1.jpg";
import image5 from "../../assets/scraped/test 1/garden-city-essentials-12.jpg";
import image6 from "../../assets/scraped/test 1/garden-city-essentials-13.jpg";
import image7 from "../../assets/scraped/test 1/garden-city-essentials-14.jpg";
import image8 from "../../assets/scraped/test 1/garden-city-essentials-15.jpg";

export const GardenCityEssentials = () => {
  const projectData = {
    title: "Garden City Essentials",
    heroImage: heroImage,
    overview: "Garden City Essentials, an eco-friendly shop offering small batch beauty and lifestyle goods, approached us on their 5th anniversary with a desire to elevate their brand's visual identity. The challenge was to create a more sophisticated and mature brand aesthetic that would reflect their reputation in the natural care space while honoring their history and core competencies.",
    process: "We began with a comprehensive brand audit, analyzing Garden City Essentials' existing visual identity, market position, and customer perceptions. This involved in-depth discussions with the client, customer surveys, and competitive analysis. The design process started with exploring various concepts that could encapsulate the brand's eco-friendly ethos and handcrafted approach. After multiple iterations and client feedback sessions, we developed a new logo featuring a GCE monogram and leaf shapes, symbolizing the brand's history and core competencies. A key element of the new design is a single continuous stroke enclosed in a circle, representing harmony, handmade products, comfort, and care. This element became a central motif in the overall brand identity, appearing across various applications. For the logotype, we selected a complementary modern sans-serif typeface that balances well with the organic shapes in the logo. The color palette was refined to reflect a more sophisticated and mature brand image while still maintaining connections to nature and sustainability.",
    images: [image1, image2, image3, image4, image5, image6, image7, image8],
    services: [
      "Creative Direction",
      "Visual Identity Design",
      "Logo Redesign",
      "Color Palette Refinement",
      "Typography Selection",
      "Signage Design",
      "Packaging Design",
      "Brand Guidelines"
    ],
    testimonial: {
      quote: "It was a pleasure working with Emmanuel. From our discovery call to the final presentation, the thought and care he put into his work was clear. Emmanuel is a talented designer, and his process and presentation skills are impeccable! He guided the experience effortlessly, and the outcome far exceeded my expectations - I felt so seen as the brand identity was revealed.",
      author: "Jolene Antle",
      company: "Garden City Essentials"
    }
  };

  return (
    <HelmetProvider>
      <Helmet>
        <meta charSet="utf-8" />
        <title> {projectData.title} | {meta.title} </title>
        <meta name="description" content={meta.description} />
      </Helmet>
      <ProjectPage {...projectData} />
    </HelmetProvider>
  );
};