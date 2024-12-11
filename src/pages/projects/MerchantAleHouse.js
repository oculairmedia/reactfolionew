import React, { useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { meta } from "../../content_option";
import ProjectPage from "../../components/ProjectPage";

// Import images
import heroImage from "../../assets/scraped/work_merchant-ale-house/the-merchant-ale-house-after.jpg";
import image1 from "../../assets/scraped/work_merchant-ale-house/the-merchant-ale-house-2.jpg";
import image2 from "../../assets/scraped/work_merchant-ale-house/the-merchant-ale-house-5.jpg";
import image3 from "../../assets/scraped/work_merchant-ale-house/the-merchant-ale-house-6.jpg";
import image4 from "../../assets/scraped/test 1/the-merchant-ale-house-1.jpg";
import image5 from "../../assets/scraped/test 1/the-merchant-ale-house-12.jpg";
import image6 from "../../assets/scraped/test 1/the-merchant-ale-house-13.jpg";
import image7 from "../../assets/scraped/test 1/the-merchant-ale-house-15.jpg";
import image8 from "../../assets/scraped/test 1/the-merchant-ale-house-16.jpg";

export const MerchantAleHouse = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const projectData = {
    title: "The Merchant Ale House",
    heroImage: heroImage,
    overview: "The Merchant Ale House, a beloved restaurant and brewpub in Downtown St. Catharines, approached us to revitalize their brand identity. With over 20 years of history, the challenge was to create a comprehensive brand identity that honors the restaurant's traditions while positioning it as the go-to destination for grain-to-glass beers and quality pub-style food.",
    process: "We began with an in-depth discovery phase, immersing ourselves in The Merchant Ale House's rich history and unique position in the local community. This involved extensive interviews with the owners and long-time patrons, as well as research into craft beer trends and pub branding. The design process kicked off with exploring various concepts that could encapsulate the pub's warm, welcoming atmosphere and its commitment to quality craft beer. We developed multiple design directions, each paying homage to different aspects of The Merchant Ale House's identity. After several rounds of refinement and client feedback, we landed on a design that perfectly balanced the pub's heritage with a contemporary feel. The new logo incorporates elements that nod to the brewing process and the pub's architectural features, creating a strong visual tie to the physical space. We then expanded the visual identity across various touchpoints, including menus, signage, merchandise, and digital assets. Multiple lockups and variations were created to maximize the flexibility of visual elements in both digital and print mediums, enhancing the brand's presence in all use-cases, large or small.",
    images: [image1, image2, image3, image4, image5, image6, image7, image8],
    services: [
      "Creative Direction",
      "Visual Identity Design",
      "Logo Redesign",
      "Merchandise Design",
      "Print Design",
      "Signage Design",
      "Packaging Design",
      "Menu Design",
      "Brand Guidelines"
    ],
    testimonial: {
      quote: "Emmanuel's work on our brand identity was professional, timely, and expertly done. He managed to accurately convey the spirit of our business. He spoke with clarity, experience, and confidence in all our meetings. We look forward to working with Emmanuel again in the future.",
      author: "Stephen Cimprich",
      company: "The Merchant Ale House"
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