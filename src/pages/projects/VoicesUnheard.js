import React, { useEffect, useRef } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col, Image } from "react-bootstrap";
import { meta } from "../../content_option";
import "./ProjectPage.css";
import "./VoicesUnheard.css";
import { motion } from "framer-motion";
import ReturnToPortfolio from "../../components/ReturnToPortfolio";

export const VoicesUnheard = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);

  useEffect(() => {
    [videoRef1, videoRef2].forEach(ref => {
      if (ref.current) {
        ref.current.addEventListener('loadeddata', () => {
          console.log('Video loaded successfully');
        });
        ref.current.addEventListener('error', (e) => {
          console.error('Error loading video:', e);
        });
      }
    });
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
        <title> Voices Unheard | {meta.title} </title>
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
          <video ref={videoRef1} autoPlay loop muted playsInline>
            <source src="https://oculair.b-cdn.net/api/v1/videos/bfbad3bf0b671badf4eb75634e9f15407ffd60ad/3rjei659/hevc" type="video/mp4" />
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
                <motion.h1 variants={itemVariants} className="display-4 mb-4">Voices Unheard: The Church and Marginalized Communities</motion.h1>
                <motion.hr variants={itemVariants} className="t_border my-4 ml-0 text-left" />
              </Col>
            </Row>
            
            <Row className="sec_sp">
              <Col lg="12">
                <motion.h3 variants={itemVariants} className="color_sec py-4">Project Summary</motion.h3>
                <motion.p variants={itemVariants}>
                  <em>Voices Unheard: The Church and Marginalized Communities</em> is a video collaboration 
                  that is part of the Inter/Access IA 360° Showcase Exhibition. This project uses AI-generated 
                  imagery to create a new 'church' for Indigenous, Queer, and POC folks, bringing together 
                  technology, art, and social commentary.
                </motion.p>
              </Col>
            </Row>

            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">The Process</motion.h3>
              </Col>
              <Col lg="7">
                <motion.p variants={itemVariants}>
                  This project was a collaborative effort by Nyle Migiizi Johnston, Nigel Nolan, and Emmanuel 
                  Umukoro - members of Highness Generates, a division of Highness Global Inc. The process began 
                  with gathering datasets from Johnston's and Nolan's artwork, which Umukoro then used to create 
                  AI-generated imagery.
                </motion.p>
                <motion.p variants={itemVariants}>
                  The objective during the creative process was to create a machine-generated collaboration of 
                  Johnston's and Nolan's work while employing Umukoro's extensive knowledge in animation and 
                  digital media. This unique approach allowed for a blend of traditional artistic styles with 
                  cutting-edge AI technology.
                </motion.p>
                <motion.p variants={itemVariants}>
                  The team worked on creating a maximalist vision that incorporates patterns, colours, plant life, 
                  astronomy, and architecture into a new concept of a "church" for marginalized communities. This 
                  process involved multiple iterations of AI-generated imagery, careful curation, and skillful 
                  animation to bring the static images to life.
                </motion.p>
              </Col>
            </Row>

            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">The Outcome</motion.h3>
              </Col>
              <Col lg="7">
                <motion.p variants={itemVariants}>
                  The final video brings together a maximalist vision of patterns, colours, plant life, astronomy, 
                  and architecture into a new "church" for Indigenous, Queer, and POC folks. <em>Voices Unheard: 
                  The Church and Marginalized Communities</em> layers imagery of the future and thoughts from our 
                  past to bring the viewer into a space to contemplate new modes of creation, awareness, and unity.
                </motion.p>
                <motion.p variants={itemVariants}>
                  This project showcases the potential of AI in creating immersive, thought-provoking art that 
                  addresses important social issues. It challenges traditional notions of religious spaces and 
                  invites viewers to consider more inclusive, diverse spiritual environments.
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
                      <Image src="https://oculair.b-cdn.net/cache/images/a464a6d79ac0a23ba1e3dca4ed8f836534ed77fd.jpg" alt="Voices Unheard" fluid />
                    </motion.div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Image src="https://oculair.b-cdn.net/cache/images/dfa646d4fc64ddb3ec60a61e5dbd8e1e1be2f4dc.jpg" alt="Voices Unheard" fluid />
                    </motion.div>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row className="sec_sp">
              <Col lg="12">
                <motion.h3 variants={itemVariants} className="color_sec py-4">Immersive Experience</motion.h3>
                <motion.div 
                  variants={itemVariants}
                  className="video-container"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <video ref={videoRef2} autoPlay loop muted playsInline>
                    <source src="https://oculair.b-cdn.net/api/v1/videos/ab378b5c663d95304309a7a814fcae6997042c36/3rjei659/avc" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </motion.div>
                <motion.p variants={itemVariants} className="mt-3">
                  This video showcases the immersive experience of the Voices Unheard project, giving viewers 
                  a first-person perspective of the installation.
                </motion.p>
              </Col>
            </Row>

            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">Project Details</motion.h3>
              </Col>
              <Col lg="7">
                <motion.ul variants={itemVariants}>
                  <motion.li variants={itemVariants}>Date: November 2023</motion.li>
                  <motion.li variants={itemVariants}>Exhibition: Inter/Access IA 360° Showcase</motion.li>
                  <motion.li variants={itemVariants}>Curators: Kyle Duffield and Terry Anastasiadis</motion.li>
                  <motion.li variants={itemVariants}>Collaborators: Nyle Migiizi Johnston, Nigel Nolan, Emmanuel Umukoro</motion.li>
                  <motion.li variants={itemVariants}>Technologies: AI-generated imagery, Digital Animation</motion.li>
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
