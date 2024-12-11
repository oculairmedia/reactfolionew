import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { meta } from "../../content_option";
import ProjectPage from "../../components/ProjectPage";

// Import images
import heroImage from "../../assets/scraped/work_coffee-by-altitude/coffee-by-altitude-1.jpg";
import image1 from "../../assets/scraped/work_coffee-by-altitude/coffee-by-altitude-2.jpg";
import image2 from "../../assets/scraped/work_coffee-by-altitude/coffee-by-altitude-3.jpg";
import image3 from "../../assets/scraped/work_coffee-by-altitude/coffee-by-altitude-4.jpg";
import image4 from "../../assets/scraped/work_coffee-by-altitude/coffee-by-altitude-5.jpg";
import image5 from "../../assets/scraped/test 1/coffee-by-altitude-10.jpg";
import image6 from "../../assets/scraped/test 1/coffee-by-altitude-12.jpg";
import image7 from "../../assets/scraped/test 1/coffee-by-altitude-13.jpg";
import image8 from "../../assets/scraped/test 1/coffee-by-altitude-15.jpg";

export const CoffeeByAltitude = () => {
  const projectData = {
    title: "Coffee by Altitude",
    heroImage: heroImage,
    overview: "Coffee by Altitude, a micro-roaster in Niagara Falls, approached us with a unique concept: focusing on beans grown at similar altitudes. Our challenge was to create a brand identity that would reflect this specialized approach while appealing to both coffee enthusiasts and process-driven consumers.",
    process: "We began with an extensive discovery phase, diving deep into the world of coffee roasting and the significance of altitude in coffee production. We conducted interviews with the client, researched competitor brands, and explored various design directions that could effectively communicate the brand's unique selling proposition. The design process started with conceptualizing a logomark that would encapsulate the essence of Coffee by Altitude. After numerous sketches and digital iterations, we landed on a design that cleverly combines a coffee cup with altimeter markings, symbolizing the blend of science and passion in their curated blends. For the logotype, we chose an incised serif typeface, inspired by the complexity of Coffee by Altitude's techniques. This typeface adds a touch of sophistication while maintaining readability across various applications. We then developed a comprehensive brand identity system, including color palettes, typography guidelines, and packaging designs. The goal was to create a modern, technology-inspired design that would set Coffee by Altitude apart in the specialty coffee market.",
    images: [image1, image2, image3, image4, image5, image6, image7, image8],
    services: [
      "Creative Direction",
      "Visual Identity Design",
      "Logo Design",
      "Typography Selection",
      "Color Palette Development",
      "Packaging Design",
      "Website Design",
      "Brand Guidelines"
    ],
    testimonial: {
      quote: "With Emmanuel's cross-sectional expertise of design and business, the branding for Coffee by Altitude went as smoothly as I could have possibly hoped for. From the ideation, to the execution and then seeing my brand in situ for the first time, Emmanuel made every step of the project insightful and easy to undertake. I couldn't be happier seeing my brand come to life.",
      author: "Adam Fletcher",
      company: "Coffee by Altitude"
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