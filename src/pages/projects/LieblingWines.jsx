import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { meta } from "../../content_option";
import ProjectPage from "../../components/ProjectPage";
import { motion } from 'framer-motion';

// Import images
import heroImage from "../../assets/scraped/work_liebling-wines/liebling-wines-1.jpg";
import image1 from "../../assets/scraped/work_liebling-wines/liebling-wines-2.jpg";
import image2 from "../../assets/scraped/work_liebling-wines/liebling-wines-3.jpg";
import image3 from "../../assets/scraped/work_liebling-wines/liebling-wines-4.jpg";
import image4 from "../../assets/scraped/work_liebling-wines/liebling-wines-5.jpg";
import image5 from "../../assets/scraped/test 1/liebling-wines--3.jpg";
import image6 from "../../assets/scraped/test 1/liebling-wines--4.jpg";
import image7 from "../../assets/scraped/test 1/liebling-wines-.jpg";
import image8 from "../../assets/scraped/test 1/liebling-wines-11.jpg";
import image9 from "../../assets/scraped/test 1/liebling-wines-15.jpg";

export const LieblingWines = () => {
  const projectData = {
    title: "Liebling Wines",
    heroImage: heroImage,
    overview: "Liebling Wines, a virtual winery located in Niagara-on-the-Lake, approached us to create a brand identity that would reflect their unique approach to winemaking. The challenge was to develop a visual language that would pay homage to the proprietors' story, recognize the value of hard work and passion, and create an approachable, sustainable, and endearing aesthetic.",
    process: "Our journey began with an extensive discovery phase, delving deep into Liebling Wines' history, production methods, and vision for the future. This involved multiple interviews with the proprietors, research into wine industry trends, and analysis of competitor branding. The design process started with conceptualizing a logomark that would encapsulate the essence of Liebling Wines. After numerous sketches and digital iterations, we landed on a stylized cornflower design. This choice acknowledges the role of earth and land in Liebling Wines' experience and product, while also nodding to the brand's historical roots in Germany. For the logotype, we developed a modern and playful spin on classic display serif fonts. This approach strikes a balance between tradition and innovation, reflecting Liebling Wines' respect for traditional winemaking methods and their forward-thinking approach to the industry. We then expanded the visual identity across various touchpoints, including bottle labels, packaging, and website design. The color palette and supporting graphical elements were carefully chosen to create a cohesive brand experience that feels both premium and approachable.",
    images: [image1, image2, image3, image4, image5, image6, image7, image8, image9],
    services: [
      "Creative Direction",
      "Visual Identity Design",
      "Logo Design",
      "Typography Selection",
      "Color Palette Development",
      "Packaging Design",
      "Label Design",
      "Website Design",
      "Brand Guidelines"
    ],
    testimonial: {
      quote: "It was a pleasure working with Emmanuel as we developed our brand identity. Emmanuel was thorough in learning who we are, our goals, and our vision. He took the time to research ideas, and clearly presented the concept and rationale behind each visual asset. Emmanuel was communicative throughout the whole process, and truly passionate about our project from conception to delivery. We highly recommend Emmanuel for his professionalism, creativity, and business acumen.",
      author: "Alison Oppenlaender",
      company: "Liebling Wines"
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <HelmetProvider>
      <Helmet>
        <meta charSet="utf-8" />
        <title> {projectData.title} | {meta.title} </title>
        <meta name="description" content={meta.description} />
      </Helmet>
      <motion.div
        className="main-content"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <ProjectPage {...projectData} />
        <div className="portfolio-summary">
          <h2>Portfolio Summary</h2>
          <div className="thumbnail-grid">
            <div className="thumbnail">
              <img src={heroImage} alt="Liebling Wines" />
              <p>Liebling Wines</p>
            </div>
            {/* Add more thumbnails for other projects */}
            {/* Example:
            <div className="thumbnail">
              <img src={otherProjectImage} alt="Other Project" />
              <p>Other Project</p>
            </div>
            */}
          </div>
        </div>
      </motion.div>
    </HelmetProvider>
  );
};

export default LieblingWines;