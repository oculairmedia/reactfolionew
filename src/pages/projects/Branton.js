import React, { useEffect, useRef } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col } from "react-bootstrap";
import { meta } from "../../content_option";
import "./ProjectPage.css";
import { motion, useInView } from "framer-motion";
import ReturnToPortfolio from "../../components/ReturnToPortfolio";

export const Branton = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const videoRef = useRef(null);
  const contentRef = useRef(null);
  const isInView = useInView(contentRef, { once: true, amount: 0.3 });

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
    title: "Branton",
    videoUrl: "https://oculair.b-cdn.net/api/v1/videos/f200bfc144e110dc4821384c82dca7d6fbd67c66/3rjei659/avc",
    overview: "In my tenure as a digital designer for Branton, a London-based design firm known for its industrial clientele, including names like McCormick and 3M, my challenge was to elevate their brand presence. The assignment: to conceive and develop brand treatments that resonate with the robust nature of industrial manufacturing yet convey the innovative spirit of the design firm.",
    process: "Leveraging the powerful procedural capabilities of Houdini, I sculpted a series of visual pieces that embody Branton's commitment to strength and precision. The process involved several key steps:\n\n1. Analyzing Branton's existing brand identity and client base\n2. Researching industrial design trends and innovative branding techniques\n3. Conceptualizing visual treatments that blend industrial strength with design innovation\n4. Utilizing Houdini to create procedurally generated designs\n5. Refining and iterating on the designs based on client feedback\n6. Finalizing a comprehensive set of brand treatments for various applications",
    services: [
      "Brand Identity Design",
      "Industrial Design",
      "Procedural Design Creation",
      "3D Modeling and Rendering",
      "Client Presentation and Collaboration"
    ],
    outcome: "The video and images showcased here represent a curated selection from a comprehensive body of work, each piece a testament to the synthesis of technical expertise and creative design that Branton offers to its distinguished industrial partners. The final brand treatments successfully elevated Branton's visual presence, aligning their image with the innovative and robust nature of their industrial clientele.",
    projectDetails: {
      date: "January 2021",
      client: "Branton",
      category: "Industrial Design, Brand Identity",
      toolsUsed: "Houdini, Adobe Creative Suite"
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
            ref={contentRef}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
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
                  <motion.li variants={itemVariants}>Client: {projectData.projectDetails.client}</motion.li>
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

export default Branton;