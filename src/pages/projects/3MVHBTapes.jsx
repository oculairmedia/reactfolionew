import React, { useEffect } from 'react';
import { Container, Row, Col, Image } from "react-bootstrap";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { meta } from "../../content_option";
import "./ProjectPage.css";
import { motion } from "framer-motion";
import ReturnToPortfolio from "../../components/ReturnToPortfolio";

const VHBTapes = () => {
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
        <title> 3M VHB Tapes | {meta.title} </title>
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
          <img src="https://oculair.b-cdn.net/cache/images/b1d7b284701359f4d25a324dd3ac3068023b3767.jpg" alt="3M VHB Tapes Hero" className="hero-image" />
        </motion.div>
        
        <Container className="content-wrapper">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Row className="mb-5 mt-3 pt-md-3">
              <Col lg="8">
                <motion.h1 variants={itemVariants} className="display-4 mb-4">3M VHB Tapes</motion.h1>
                <motion.hr variants={itemVariants} className="t_border my-4 ml-0 text-left" />
              </Col>
            </Row>
            
            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">Project Overview</motion.h3>
              </Col>
              <Col lg="7">
                <motion.p variants={itemVariants}>
                  The 3M VHB Tape campaign artfully magnifies the brand's pivotal role in redefining modern construction paradigms with compelling visuals. By harmonizing the technical prowess of 3D modeling with the refined aesthetics of graphic design, the project illuminates the transformative quality of the tape. It unveils the seamless integration and dual advantages it offers to architectural structures: enhancing both their visual allure and functional integrity.
                </motion.p>
              </Col>
            </Row>

            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">Collaboration with Marketing</motion.h3>
              </Col>
              <Col lg="7">
                <motion.p variants={itemVariants}>
                  Working closely with the marketing team, I took their specific requirements into account while creating a gorgeous 3D illustration. The collaboration ensured that the visuals not only met the aesthetic standards but also effectively communicated the product's unique selling points. We focused on showcasing the tape's strength, versatility, and application in modern construction techniques.
                </motion.p>
              </Col>
            </Row>

            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">Design Approach</motion.h3>
              </Col>
              <Col lg="7">
                <motion.p variants={itemVariants}>
                  The cleverly crafted illustrations bring to life the tape as an indispensable facilitator of state-of-the-art, avant-garde building methods. These visuals double as an educational tool and a tribute to 3M's technological influence within the industry. Rooted in the company's slogan, "Science. Applied to Life.™", the imagery is strategically placed within print collateral to engage and enlighten construction aficionados and stakeholders.
                </motion.p>
              </Col>
            </Row>

            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">Project Impact</motion.h3>
              </Col>
              <Col lg="7">
                <motion.p variants={itemVariants}>
                  The thoughtfully constructed narrative not only underscores 3M's dedication to innovation but also strengthens its stature as a harbinger of industrial evolution. The campaign successfully highlights the tape's role in enhancing both the visual appeal and functional integrity of architectural structures.
                </motion.p>
              </Col>
            </Row>

            <Row className="sec_sp">
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">Project Images</motion.h3>
              </Col>
              <Col lg="7">
                <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Image src="https://oculair.b-cdn.net/cache/images/b1d7b284701359f4d25a324dd3ac3068023b3767.jpg" alt="3M VHB Tapes Main" fluid className="mb-3" />
                </motion.div>
                <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Image src="https://oculair.b-cdn.net/cache/images/331aa47bc461aa7d566b45bd9cd594ac4f11aab8.jpg" alt="3M VHB Tapes Detail 1" fluid className="mb-3" />
                </motion.div>
                <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Image src="https://oculair.b-cdn.net/cache/images/b9ad119a86d87268147a3b188c145d395277b033.jpg" alt="3M VHB Tapes Detail 2" fluid className="mb-3" />
                </motion.div>
              </Col>
            </Row>
          </motion.div>
        </Container>
        <ReturnToPortfolio />
      </motion.div>
    </HelmetProvider>
  );
};

export default VHBTapes;