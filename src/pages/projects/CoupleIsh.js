import React, { useEffect } from 'react';
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col, Image } from "react-bootstrap";
import { meta } from "../../content_option";
import "./ProjectPage.css";
import { motion } from "framer-motion";
import ReturnToPortfolio from "../../components/ReturnToPortfolio";

const CoupleIsh = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
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
        <title> Couple-Ish | {meta.title} </title>
        <meta name="description" content={meta.description} />
      </Helmet>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="hero-section"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <img src="https://oculair.b-cdn.net/cache/images/28690189625a7d5ecf17b8a213a41e053b848ab9.jpg" alt="Couple-Ish Hero" className="hero-image" />
        </motion.div>
        
        <Container className="content-wrapper">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Row className="mb-5 mt-3 pt-md-3">
              <Col lg="8">
                <motion.h1 variants={itemVariants} className="display-4 mb-4">Couple-Ish</motion.h1>
                <motion.hr variants={itemVariants} className="t_border my-4 ml-0 text-left" />
              </Col>
            </Row>
            
            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">Project Overview</motion.h3>
              </Col>
              <Col lg="7">
                <motion.p variants={itemVariants}>
                  Couple-ish is a new Canadian produced LGBTQ web series. It's about Dee, a bisexual, non-binary Canadian illustrator, who finds themselves locked into a lease they can't afford. With the help of younger sister Amy, Dee thinks they find the perfect new roommate in Rachel, a queer British bartender.
                </motion.p>
              </Col>
            </Row>

            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">Design Challenge</motion.h3>
              </Col>
              <Col lg="7">
                <motion.p variants={itemVariants}>
                  The challenge here was to create promotional posters that would convey the characters' unique personalities. We also made the posters complementary to increase collectability.
                </motion.p>
              </Col>
            </Row>

            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">Project Details</motion.h3>
              </Col>
              <Col lg="7">
                <motion.ul variants={itemVariants}>
                  <motion.li variants={itemVariants}>Date: February 2024</motion.li>
                  <motion.li variants={itemVariants}>Client: Couple-Ish Web Series</motion.li>
                  <motion.li variants={itemVariants}>Categories: Photography, Digital Illustration, Poster Design</motion.li>
                </motion.ul>
              </Col>
            </Row>

            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">Project Gallery</motion.h3>
              </Col>
              <Col lg="7">
                <Row>
                  <Col md={6} className="mb-3">
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <a href="https://oculair.b-cdn.net/cache/images/a029bae20e35b0b564a8c4762f67c9abaae66d80.jpg" target="_blank" rel="noopener noreferrer">
                        <Image src="https://oculair.b-cdn.net/cache/images/f6d1f7b99f9131662c73d852d3b85ff78b6cb3ed.jpg" alt="Couple-Ish Poster 1" fluid />
                      </a>
                    </motion.div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <a href="https://oculair.b-cdn.net/cache/images/17bbf62cbc36cc056e93223715af6aabdf5557c7.jpg" target="_blank" rel="noopener noreferrer">
                        <Image src="https://oculair.b-cdn.net/cache/images/91395cace35d1ca9677e9ae3dc43b942066c7f5e.jpg" alt="Couple-Ish Poster 2" fluid />
                      </a>
                    </motion.div>
                  </Col>
                </Row>
                <Row>
                  <Col md={6} className="mb-3">
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <a href="https://oculair.b-cdn.net/cache/images/28690189625a7d5ecf17b8a213a41e053b848ab9.jpg" target="_blank" rel="noopener noreferrer">
                        <Image src="https://oculair.b-cdn.net/cache/images/ac06808c40ef634d63be93d53ef4c8a02cc583d6.jpg" alt="Couple-Ish Poster 3" fluid />
                      </a>
                    </motion.div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <a href="https://oculair.b-cdn.net/cache/images/b610153fe322a352165f5a2d276e21607871538a.jpg" target="_blank" rel="noopener noreferrer">
                        <Image src="https://oculair.b-cdn.net/cache/images/2e23d30bbb96e5ae25a832384b769dc709596d75.jpg" alt="Couple-Ish Poster 4" fluid />
                      </a>
                    </motion.div>
                  </Col>
                </Row>
                <Row>
                  <Col md={6} className="mb-3">
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <a href="https://oculair.b-cdn.net/cache/images/9fcd06b9730a6bb5becde94d5aaf6e0bba511583.jpg" target="_blank" rel="noopener noreferrer">
                        <Image src="https://oculair.b-cdn.net/cache/images/23b04640b4bbc8cbfb064d8089caa2b84d7d1b89.jpg" alt="Couple-Ish Poster 5" fluid />
                      </a>
                    </motion.div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </motion.div>
        </Container>
        <ReturnToPortfolio />
      </motion.div>
    </HelmetProvider>
  );
};

export default CoupleIsh;