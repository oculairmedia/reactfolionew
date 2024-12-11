import React, { useEffect, useRef } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col } from "react-bootstrap";
import { meta } from "../../content_option";
import "./ProjectPage.css";
import { motion } from "framer-motion";
import ReturnToPortfolio from "../../components/ReturnToPortfolio";

const AquaticResonance = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadeddata', () => {
        console.log('Video loaded successfully');
      });
      videoRef.current.addEventListener('error', (e) => {
        console.error('Error loading video:', e);
      });
    }
  }, []);

  const projectData = {
    title: "Aquatic Resonance",
    videoUrl: "https://files.oculair.ca/api/v1/videos/29d980a5d2fff954196daf60232e7072ebac9752/3rjei659/avc",
    overview: "In collaboration with a close friend, Arnie Guha, this piece transforms a static canvas into a vibrant, breathing animation. Melding their original art with my digital alchemy, we've created a fluid dance of color and form, igniting the artwork with motion that resonates with the ebb and flow of oceanic life.",
    process: "The process began with Arnie Guha's original artwork, which we then digitized and prepared for animation. Using advanced digital tools and techniques, we brought the static image to life, carefully preserving the integrity of the original piece while infusing it with dynamic movement that mimics the graceful sway of underwater flora.",
    services: [
      "Digital Animation",
      "Art Collaboration",
      "Motion Design",
      "Creative Direction"
    ],
    outcome: "Each frame of the animation is a testament to the synergy of our friendship and shared artistic vision. The piece demonstrates that art should not just be seen, but felt and experienced, inviting viewers to immerse themselves in a dynamic, ever-changing visual journey that echoes the rhythms of the ocean.",
    projectDetails: {
      date: "March 2024",
      collaborator: "Arnie Guha",
      category: "Digital Animation, Art Collaboration",
      toolsUsed: "Adobe After Effects, Custom JavaScript for animation"
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="video-container main-image"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <video ref={videoRef} autoPlay loop muted playsInline>
            <source src={projectData.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </motion.div>
        
        <Container className="content-wrapper">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Row className="mb-5 mt-3 pt-md-3">
              <Col lg="12">
                <motion.h1 variants={itemVariants} className="display-4 mb-4">{projectData.title}</motion.h1>
                <motion.hr variants={itemVariants} className="t_border my-4 ml-0 text-left" />
              </Col>
            </Row>
            
            <Row className="sec_sp">
              <Col lg="12">
                <motion.h3 variants={itemVariants} className="color_sec py-4">Project Overview</motion.h3>
                <motion.p variants={itemVariants}>{projectData.overview}</motion.p>
              </Col>
            </Row>

            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">The Process</motion.h3>
              </Col>
              <Col lg="7">
                <motion.p variants={itemVariants}>{projectData.process}</motion.p>
              </Col>
            </Row>

            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">Services Provided</motion.h3>
              </Col>
              <Col lg="7">
                <motion.ul variants={itemVariants}>
                  {projectData.services.map((service, index) => (
                    <motion.li key={index} variants={itemVariants}>{service}</motion.li>
                  ))}
                </motion.ul>
              </Col>
            </Row>

            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">The Outcome</motion.h3>
              </Col>
              <Col lg="7">
                <motion.p variants={itemVariants}>{projectData.outcome}</motion.p>
              </Col>
            </Row>

            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">Project Details</motion.h3>
              </Col>
              <Col lg="7">
                <motion.ul variants={itemVariants}>
                  <motion.li variants={itemVariants}>Date: {projectData.projectDetails.date}</motion.li>
                  <motion.li variants={itemVariants}>Collaborator: {projectData.projectDetails.collaborator}</motion.li>
                  <motion.li variants={itemVariants}>Category: {projectData.projectDetails.category}</motion.li>
                  <motion.li variants={itemVariants}>Tools Used: {projectData.projectDetails.toolsUsed}</motion.li>
                </motion.ul>
              </Col>
            </Row>
          </motion.div>
        </Container>
        <ReturnToPortfolio />
      </motion.div>
    </HelmetProvider>
  );
};

export default AquaticResonance;