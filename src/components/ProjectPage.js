import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './ProjectPage.css';
import { motion, useInView } from "framer-motion";
import ReturnToPortfolio from './ReturnToPortfolio';

const ProjectPage = ({ title, heroImage, overview, images, services, testimonial, process }) => {
  const scrollRef = useRef(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [expandedImageStyle, setExpandedImageStyle] = useState({});
  const contentRef = useRef(null);
  const isInView = useInView(contentRef, { once: true, amount: 0.3 });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      const scrollWidth = scrollContainer.scrollWidth;
      const animationDuration = scrollWidth * 0.05;

      scrollContainer.style.setProperty('--scroll-width', `${scrollWidth}px`);
      scrollContainer.style.setProperty('--animation-duration', `${animationDuration}s`);
      scrollContainer.classList.add('scrolling');

      const handleMouseEnter = (e) => {
        if (e.target.closest('.project-image')) {
          scrollContainer.style.animationPlayState = 'paused';
        }
      };

      const handleMouseLeave = (e) => {
        if (e.target.closest('.project-image')) {
          scrollContainer.style.animationPlayState = 'running';
        }
      };

      scrollContainer.addEventListener('mouseenter', handleMouseEnter, true);
      scrollContainer.addEventListener('mouseleave', handleMouseLeave, true);

      return () => {
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter, true);
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave, true);
      };
    }
  }, []);

  useEffect(() => {
    if (expandedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [expandedImage]);

  const handleImageClick = (img, event) => {
    if (expandedImage === img) {
      setExpandedImage(null);
      setExpandedImageStyle({});
    } else {
      const rect = event.target.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      setExpandedImageStyle({
        top: `${rect.top + scrollTop}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });
      
      setExpandedImage(img);
      
      // Force a reflow before adding the 'expanded' class
      setTimeout(() => {
        setExpandedImageStyle({});
      }, 50);
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
    <motion.div 
      className={`project-page ${expandedImage ? 'dimmed' : ''}`}
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
        <img src={heroImage} alt={`${title} hero`} className="hero-image" />
      </motion.div>
      
      <Container>
        <motion.h1 
          className="project-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {title}
        </motion.h1>
        
        <motion.div
          ref={contentRef}
          className="content-section"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <Row>
            <Col lg={12}>
              <motion.h2 variants={itemVariants}>Overview</motion.h2>
              <motion.p variants={itemVariants}>{overview}</motion.p>
              <motion.h2 variants={itemVariants}>The Process</motion.h2>
              <motion.p variants={itemVariants}>{process}</motion.p>
            </Col>
          </Row>
        </motion.div>
      </Container>
      
      <motion.div 
        className="image-scroll-container" 
        ref={scrollRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="image-scroll-content">
          {images.concat(images).map((img, index) => (
            <motion.div 
              key={index} 
              className={`project-image ${expandedImage === img ? 'expanded' : ''}`}
              onClick={(e) => handleImageClick(img, e)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src={img} alt={`${title} - Image ${index + 1}`} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <Container>
        <motion.div
          className="services-testimonial-section"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <Row>
            <Col lg={6}>
              <motion.h3 variants={itemVariants}>Services Provided</motion.h3>
              <motion.ul variants={itemVariants}>
                {services.map((service, index) => (
                  <motion.li key={index} variants={itemVariants}>{service}</motion.li>
                ))}
              </motion.ul>
            </Col>
            <Col lg={6}>
              {testimonial && (
                <motion.div className="testimonial" variants={itemVariants}>
                  <motion.h3 variants={itemVariants}>Client Testimonial</motion.h3>
                  <motion.blockquote variants={itemVariants}>
                    "{testimonial.quote}"
                    <motion.footer variants={itemVariants}>- {testimonial.author}, {testimonial.company}</motion.footer>
                  </motion.blockquote>
                </motion.div>
              )}
            </Col>
          </Row>
        </motion.div>
      </Container>

      {expandedImage && (
        <motion.div 
          className="image-overlay" 
          onClick={() => handleImageClick(expandedImage)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.img 
            src={expandedImage} 
            alt="Expanded view" 
            style={expandedImageStyle}
            className="expanded-image"
            layoutId={expandedImage}
          />
        </motion.div>
      )}
      <ReturnToPortfolio />
    </motion.div>
  );
};

export default ProjectPage;