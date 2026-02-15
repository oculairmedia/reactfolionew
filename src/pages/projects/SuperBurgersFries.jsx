import React, { useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { meta } from "../../content_option";
import ProjectPage from "../../components/ProjectPage";

// Import images
import heroImage from "../../assets/scraped/work_super-burgers-fries/super-burgers-fries-1.jpg";
import image1 from "../../assets/scraped/work_super-burgers-fries/super-burgers-fries-2.jpg";
import image2 from "../../assets/scraped/work_super-burgers-fries/super-burgers-fries-3.jpg";
import image3 from "../../assets/scraped/work_super-burgers-fries/super-burgers-fries-4.jpg";
import image4 from "../../assets/scraped/work_super-burgers-fries/super-burgers-fries-5.jpg";
import image5 from "../../assets/scraped/work_super-burgers-fries/super-burgers-fries-9.jpg";
import image6 from "../../assets/scraped/work_super-burgers-fries/super-burgers-fries-10.jpg";
import image7 from "../../assets/scraped/work_super-burgers-fries/super-burgers-fries-11.jpg";
import image8 from "../../assets/scraped/work_super-burgers-fries/super-burgers-fries-16.jpg";

export const SuperBurgersFries = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const projectData = {
    title: "Super! Burgers & Fries",
    heroImage: heroImage,
    overview: "Super Burgers & Fries, a vibrant fast-food restaurant in St. Catharines, approached us with a vision to create a brand identity that would stand out in a crowded market. Our challenge was to develop a visual language that captured the essence of their fresh, high-quality offerings while maintaining a fun and approachable aesthetic.",
    process: "Our journey began with an in-depth discovery phase, where we immersed ourselves in the world of fast food branding and Super Burgers & Fries' unique positioning. We conducted market research, analyzed competitor branding, and held multiple workshops with the client to understand their vision and values. The design process kicked off with extensive sketching and ideation. We explored various directions, from playful illustrated characters to bold typographic treatments. After several rounds of refinement, we landed on a concept that perfectly balanced boldness with approachability. The final logotype uses a custom-designed, bold typeface that emphasizes visibility and legibility, crucial for a fast-food brand. We integrated a subtle burger icon within the letterforms, achieving a seamless blend of text and symbol. The color palette, featuring vibrant yellows and reds, was carefully chosen to evoke feelings of energy and appetite appeal. We then expanded the visual identity across various touchpoints, including packaging, signage, and digital assets. Hand-drawn illustrations were created to add a layer of personality and storytelling to the brand materials.",
    images: [image1, image2, image3, image4, image5, image6, image7, image8],
    services: [
      "Creative Direction",
      "Visual Identity Design",
      "Logo Design",
      "Color Palette Development",
      "Typography Selection",
      "Illustration",
      "Print Design",
      "Packaging Design",
      "Signage Design",
      "Brand Guidelines"
    ],
    testimonial: {
      quote: "Emmanuel is without a doubt the best graphic designer in the Niagara Region, with a meticulous eye for design, broad range, and unmatched work ethic. I have trusted him with multiple projects over the last few years and have never been disappointed.",
      author: "Erik Dickson",
      company: "Super! Burgers & Fries"
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