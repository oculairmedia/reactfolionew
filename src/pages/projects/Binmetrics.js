import React, { useEffect, useRef } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col, Image } from "react-bootstrap";
import { meta } from "../../content_option";
import "./ProjectPage.css";
import { motion, useInView } from "framer-motion";
import ReturnToPortfolio from "../../components/ReturnToPortfolio";

const Binmetrics = () => {
  const contentRef = useRef(null);
  const isInView = useInView(contentRef, { once: true, amount: 0.3 });
  const videoRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        <title> Binmetrics | {meta.title} </title>
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
            <source src="https://oculair.b-cdn.net/api/v1/videos/332b28a6113e401b77b6894d3254766d15c6a9ac/3rjei659/avc" type="video/mp4" />
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
                <motion.h1 variants={itemVariants} className="display-4 mb-4">Binmetrics</motion.h1>
                <motion.hr variants={itemVariants} className="t_border my-4 ml-0 text-left" />
              </Col>
            </Row>
            
            <Row className="sec_sp">
              <Col lg="12">
                <motion.h3 variants={itemVariants} className="color_sec py-4">Project Overview</motion.h3>
                <motion.p variants={itemVariants}>
                  During my time at Bin Metrics, I played a pivotal role in shaping the user experience of a cutting-edge logistics management and asset tracking solution. At the intersection of technology and design, I crafted the visual brand identity, formulating the branding style sheets and the logo that became the face of Bin Metrics. My responsibilities extended into the digital realm, where I meticulously developed user flows for an array of platforms, including web pages, web applications, and mobile apps, all aimed at enhancing user interaction and functionality.
                </motion.p>
              </Col>
            </Row>

            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">B2B Engagement and Prototyping</motion.h3>
              </Col>
              <Col lg="7">
                <motion.p variants={itemVariants}>
                  In addition to establishing the UX foundations, I contributed significantly to business-to-business (B2B) engagements, designing a web page optimized for conversion, serving as a critical touchpoint for prospective partners. My involvement with the product extended beyond the digital surface; I embraced the possibilities of additive manufacturing to construct the initial product prototype.
                </motion.p>
                <motion.p variants={itemVariants}>
                  This process not only expedited the development phase but also allowed for a seamless transition into creating marketing materials, leveraging the 3D models for visual consistency across all collateral. My tenure at Bin Metrics was marked by a harmonious blend of design, innovation, and strategic marketing, driving forward both the product and the brand.
                </motion.p>
              </Col>
            </Row>

            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">Project Images</motion.h3>
              </Col>
              <Col lg="7">
                <Row>
                  <Col md={6} className="mb-3">
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Image src="https://oculair.b-cdn.net/cache/images/cd3938b537ae6d5b28caf0c6863f6f07187f3a45.jpg" alt="Binmetrics Logo Exploration" fluid />
                    </motion.div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <a href="https://oculair.b-cdn.net/cache/images/89d8280f7f38e0180c4afa043c3dbf3aefdd82bc.jpg" target="_blank" rel="noopener noreferrer">
                        <Image src="https://oculair.b-cdn.net/cache/images/fea60e443eff3c6b5fe78b5e11d5eda00ba7aade.jpg" alt="Binmetrics Design 1" fluid />
                      </a>
                    </motion.div>
                  </Col>
                </Row>
                <Row>
                  <Col md={6} className="mb-3">
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <a href="https://oculair.b-cdn.net/cache/images/1896f283c70112ca63baf4081c08ac0ae5e74573.jpg" target="_blank" rel="noopener noreferrer">
                        <Image src="https://oculair.b-cdn.net/cache/images/dd2ad260c84719d08a0323a76904c3d38b16f845.jpg" alt="Binmetrics Design 2" fluid />
                      </a>
                    </motion.div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <a href="https://oculair.b-cdn.net/cache/images/008d59decaadca3dd12d0272809a4b4000500a2a.png" target="_blank" rel="noopener noreferrer">
                        <Image src="https://oculair.b-cdn.net/cache/images/3be2f00ca74e7fe41a918dd20d083589121273ee.png" alt="Binmetrics Design 3" fluid />
                      </a>
                    </motion.div>
                  </Col>
                </Row>
                <Row>
                  <Col md={6} className="mb-3">
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <a href="https://oculair.b-cdn.net/cache/images/8ec6a631d0dd897a2a4638599ebfb94f05797d78.jpg" target="_blank" rel="noopener noreferrer">
                        <Image src="https://oculair.b-cdn.net/cache/images/d12dd19b1948d8a5e9be46e1d65f2604cad27c81.jpg" alt="Binmetrics Design 4" fluid />
                      </a>
                    </motion.div>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">Project Details</motion.h3>
              </Col>
              <Col lg="7">
                <motion.ul variants={itemVariants}>
                  <motion.li variants={itemVariants}>Date: February 2024</motion.li>
                  <motion.li variants={itemVariants}>Client: Bin Metrics</motion.li>
                  <motion.li variants={itemVariants}>Role: UX/UI Designer, Brand Identity Designer</motion.li>
                  <motion.li variants={itemVariants}>Technologies: Web Design, Mobile App Design, 3D Prototyping</motion.li>
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

export default Binmetrics;