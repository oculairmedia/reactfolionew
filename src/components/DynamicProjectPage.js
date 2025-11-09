import React, { useEffect, useRef } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col, Image } from "react-bootstrap";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { meta } from "../content_option";
import ReturnToPortfolio from "./ReturnToPortfolio";
import "./ProjectPage.css";

// Import all project JSON files
const projectContext = require.context('../content/projects', false, /\.json$/);
const allProjects = {};

projectContext.keys().forEach((key) => {
  const projectId = key.replace('./', '').replace('.json', '');
  allProjects[projectId] = projectContext(key);
});

const DynamicProjectPage = () => {
  const { slug } = useParams();
  const project = allProjects[slug];

  const videoRefs = useRef([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    videoRefs.current.forEach(ref => {
      if (ref) {
        ref.addEventListener('loadeddata', () => {
          console.log('Video loaded successfully');
        });
        ref.addEventListener('error', (e) => {
          console.error('Error loading video:', e);
        });
      }
    });
  }, [project]);

  if (!project) {
    return <Navigate to="/portfolio" replace />;
  }

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

  // Helper to render hero media
  const renderHero = () => {
    if (!project.hero) return null;

    if (project.hero.type === 'video' && project.hero.video) {
      return (
        <motion.div
          className="video-container main-image"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <video
            ref={el => videoRefs.current.push(el)}
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={project.hero.video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </motion.div>
      );
    }

    if (project.hero.type === 'image' && project.hero.image) {
      return (
        <motion.div
          className="video-container main-image"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <img
            src={project.hero.image}
            alt={project.hero.alt || project.title}
            style={{ width: '100%', height: 'auto' }}
          />
        </motion.div>
      );
    }

    return null;
  };

  // Helper to render content sections
  const renderSections = () => {
    if (!project.sections || project.sections.length === 0) return null;

    return project.sections.map((section, index) => {
      const isFullWidth = !section.layout || section.layout === 'full-width';

      return (
        <Row className="sec_sp" key={index}>
          {isFullWidth ? (
            <Col lg="12">
              <motion.h3 variants={itemVariants} className="color_sec py-4">
                {section.title}
              </motion.h3>
              <motion.div variants={itemVariants}>
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </motion.div>
            </Col>
          ) : (
            <>
              <Col lg="5">
                <motion.h3 variants={itemVariants} className="color_sec py-4">
                  {section.title}
                </motion.h3>
              </Col>
              <Col lg="7">
                <motion.div variants={itemVariants}>
                  <ReactMarkdown>{section.content}</ReactMarkdown>
                </motion.div>
              </Col>
            </>
          )}
        </Row>
      );
    });
  };

  // Helper to render gallery
  const renderGallery = () => {
    if (!project.gallery || project.gallery.length === 0) return null;

    const fullWidthItems = project.gallery.filter(item => item.width === 'full');
    const halfWidthItems = project.gallery.filter(item => item.width === 'half');

    return (
      <>
        {halfWidthItems.length > 0 && (
          <Row className="sec_sp">
            <Col lg="5">
              <motion.h3 variants={itemVariants} className="color_sec py-4">
                Project Gallery
              </motion.h3>
            </Col>
            <Col lg="7">
              <Row>
                {halfWidthItems.map((item, index) => (
                  <Col md={6} className="mb-3" key={`half-${index}`}>
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.type === 'image' ? (
                        <Image
                          src={item.url}
                          alt={item.caption || `${project.title} - Image ${index + 1}`}
                          fluid
                        />
                      ) : (
                        <video
                          ref={el => videoRefs.current.push(el)}
                          autoPlay
                          loop
                          muted
                          playsInline
                          style={{ width: '100%' }}
                        >
                          <source src={item.url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        )}

        {fullWidthItems.map((item, index) => (
          <Row className="sec_sp" key={`full-${index}`}>
            <Col lg="12">
              {index === 0 && halfWidthItems.length === 0 && (
                <motion.h3 variants={itemVariants} className="color_sec py-4">
                  {item.caption || 'Project Gallery'}
                </motion.h3>
              )}
              <motion.div
                variants={itemVariants}
                className="video-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {item.type === 'image' ? (
                  <Image
                    src={item.url}
                    alt={item.caption || `${project.title} - Image ${index + 1}`}
                    fluid
                  />
                ) : (
                  <video
                    ref={el => videoRefs.current.push(el)}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ width: '100%' }}
                  >
                    <source src={item.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </motion.div>
              {item.caption && (
                <motion.p variants={itemVariants} className="mt-3">
                  {item.caption}
                </motion.p>
              )}
            </Col>
          </Row>
        ))}
      </>
    );
  };

  // Helper to render metadata
  const renderMetadata = () => {
    if (!project.metadata) return null;

    const metadata = project.metadata;
    const hasMetadata = Object.values(metadata).some(val => val);

    if (!hasMetadata) return null;

    return (
      <Row className="sec_sp">
        <Col lg="5">
          <motion.h3 variants={itemVariants} className="color_sec py-4">
            Project Details
          </motion.h3>
        </Col>
        <Col lg="7">
          <motion.ul variants={itemVariants}>
            {metadata.date && (
              <motion.li variants={itemVariants}>Date: {metadata.date}</motion.li>
            )}
            {metadata.client && (
              <motion.li variants={itemVariants}>Client: {metadata.client}</motion.li>
            )}
            {metadata.role && (
              <motion.li variants={itemVariants}>Role: {metadata.role}</motion.li>
            )}
            {metadata.exhibition && (
              <motion.li variants={itemVariants}>Exhibition: {metadata.exhibition}</motion.li>
            )}
            {metadata.curators && (
              <motion.li variants={itemVariants}>Curators: {metadata.curators}</motion.li>
            )}
            {metadata.collaborators && (
              <motion.li variants={itemVariants}>Collaborators: {metadata.collaborators}</motion.li>
            )}
            {metadata.technologies && (
              <motion.li variants={itemVariants}>Technologies: {metadata.technologies}</motion.li>
            )}
          </motion.ul>
        </Col>
      </Row>
    );
  };

  return (
    <HelmetProvider>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{project.title} | {meta.title}</title>
        <meta name="description" content={project.subtitle || meta.description} />
      </Helmet>

      <motion.div
        className="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {renderHero()}

        <Container className="content-wrapper">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Row className="mb-5 mt-3 pt-md-3">
              <Col lg="12">
                <motion.h1 variants={itemVariants} className="display-4 mb-4">
                  {project.title}
                </motion.h1>
                {project.subtitle && (
                  <motion.p variants={itemVariants} className="lead">
                    {project.subtitle}
                  </motion.p>
                )}
                <motion.hr variants={itemVariants} className="t_border my-4 ml-0 text-left" />
              </Col>
            </Row>

            {renderSections()}
            {renderGallery()}
            {renderMetadata()}
          </motion.div>
        </Container>
        <ReturnToPortfolio />
      </motion.div>
    </HelmetProvider>
  );
};

export default DynamicProjectPage;
