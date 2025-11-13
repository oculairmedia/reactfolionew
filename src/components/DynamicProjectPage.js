import React, { useEffect, useRef, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col, Image } from "react-bootstrap";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { meta } from "../content_option";
import { getProjectById } from "../utils/payloadApi";
import ReturnToPortfolio from "./ReturnToPortfolio";
import "./ProjectPage.css";

const DynamicProjectPage = () => {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const videoRefs = useRef([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch project data from CMS
    const fetchProject = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const projectData = await getProjectById(slug);

        if (projectData) {
          setProject(projectData);
        } else {
          // Fallback to static data if CMS fails
          const projectContext = require.context('../content/projects', false, /\.json$/);
          const allProjects = {};
          projectContext.keys().forEach((key) => {
            const projectId = key.replace('./', '').replace('.json', '');
            allProjects[projectId] = projectContext(key);
          });

          if (allProjects[slug]) {
            setProject(allProjects[slug]);
          } else {
            setNotFound(true);
          }
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        // Fallback to static data
        try {
          const projectContext = require.context('../content/projects', false, /\.json$/);
          const allProjects = {};
          projectContext.keys().forEach((key) => {
            const projectId = key.replace('./', '').replace('.json', '');
            allProjects[projectId] = projectContext(key);
          });

          if (allProjects[slug]) {
            setProject(allProjects[slug]);
          } else {
            setNotFound(true);
          }
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
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

  if (loading) {
    return (
      <HelmetProvider>
        <Container className="content-wrapper">
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading project...</div>
        </Container>
      </HelmetProvider>
    );
  }

  if (notFound || !project) {
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
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
            }}
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
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        </motion.div>
      );
    }

    return null;
  };

  // Helper to render content sections with automatic image interleaving
  const renderSections = () => {
    if (!project.sections || project.sections.length === 0) return null;

    const sections = project.sections;
    const galleryImages = project.gallery ? project.gallery.map(item => 
      typeof item === 'string' ? item : item.url || item
    ) : [];

    const elements = [];
    let imageIndex = 0;

    sections.forEach((section, index) => {
      // Determine if we should show an image with this section
      const shouldShowImage = imageIndex < galleryImages.length;
      
      // Alternate layout pattern: image-left, image-right, full-width
      let layoutPattern;
      if (index % 3 === 0) {
        layoutPattern = 'image-left';
      } else if (index % 3 === 1) {
        layoutPattern = 'image-right';
      } else {
        layoutPattern = 'full-width';
      }

      // IMAGE-LEFT: Image on left, text on right
      if (layoutPattern === 'image-left' && shouldShowImage) {
        elements.push(
          <Row className="sec_sp align-items-center" key={`section-${index}`}>
            <Col lg="5" md="12" className="mb-4 mb-lg-0">
              <motion.div 
                variants={itemVariants} 
                whileHover={{ scale: 1.02 }}
                style={{ overflow: 'hidden', borderRadius: '4px' }}
              >
                <Image 
                  src={galleryImages[imageIndex]} 
                  alt={section.title} 
                  fluid 
                  style={{ width: '100%', height: 'auto' }} 
                />
              </motion.div>
            </Col>
            <Col lg="7" md="12">
              <motion.h3 variants={itemVariants} className="color_sec py-4">
                {section.title}
              </motion.h3>
              <motion.div variants={itemVariants}>
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </motion.div>
            </Col>
          </Row>
        );
        imageIndex++;
        return;
      }

      // IMAGE-RIGHT: Text on left, image on right
      if (layoutPattern === 'image-right' && shouldShowImage) {
        elements.push(
          <Row className="sec_sp align-items-center" key={`section-${index}`}>
            <Col lg="7" md="12" className="mb-4 mb-lg-0 order-2 order-lg-1">
              <motion.h3 variants={itemVariants} className="color_sec py-4">
                {section.title}
              </motion.h3>
              <motion.div variants={itemVariants}>
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </motion.div>
            </Col>
            <Col lg="5" md="12" className="order-1 order-lg-2 mb-4 mb-lg-0">
              <motion.div 
                variants={itemVariants} 
                whileHover={{ scale: 1.02 }}
                style={{ overflow: 'hidden', borderRadius: '4px' }}
              >
                <Image 
                  src={galleryImages[imageIndex]} 
                  alt={section.title} 
                  fluid 
                  style={{ width: '100%', height: 'auto' }} 
                />
              </motion.div>
            </Col>
          </Row>
        );
        imageIndex++;
        return;
      }

      // FULL-WIDTH: Text only
      elements.push(
        <Row className="sec_sp" key={`section-${index}`}>
          <Col lg="10" md="12" className="mx-auto">
            <motion.h3 variants={itemVariants} className="color_sec py-4">
              {section.title}
            </motion.h3>
            <motion.div variants={itemVariants}>
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </motion.div>
          </Col>
        </Row>
      );
    });

    // Add any remaining gallery images
    if (imageIndex < galleryImages.length) {
      const remainingImages = galleryImages.slice(imageIndex);
      
      elements.push(
        <Row className="sec_sp" key="remaining-gallery">
          <Col lg="12">
            <motion.h3 variants={itemVariants} className="color_sec py-4 text-center">
              More from the Project
            </motion.h3>
          </Col>
          {remainingImages.map((img, idx) => (
            <Col lg={remainingImages.length === 1 ? 12 : 6} md="12" className="mb-4" key={`extra-img-${idx}`}>
              <motion.div 
                variants={itemVariants} 
                whileHover={{ scale: 1.02 }}
                style={{ overflow: 'hidden', borderRadius: '4px' }}
              >
                <Image src={img} alt={`Gallery image ${imageIndex + idx + 1}`} fluid />
              </motion.div>
            </Col>
          ))}
        </Row>
      );
    }

    return elements;
  };



  // Helper to render gallery
  const renderGallery = () => {
    if (!project.gallery || project.gallery.length === 0) return null;

    // For Couple-ish, create a dynamic layout pattern
    // First image: full width
    // Next two: half width side by side
    // Next one: full width
    // Remaining: half width
    const galleryItems = project.gallery.map(item => 
      typeof item === 'string' ? { url: item, type: 'image' } : item
    );

    const renderGalleryItem = (item, index, colSize = 12) => {
      const content = item.type === 'video' ? (
        <video
          ref={el => videoRefs.current.push(el)}
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: 'auto' }}
          onError={(e) => {
            console.error('Video load error:', item.url, e);
          }}
          onLoadedData={() => {
            console.log('Video loaded:', item.url);
          }}
        >
          <source src={item.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <Image
          src={item.url || item}
          alt={item.caption || `${project.title} - Image ${index + 1}`}
          fluid
          style={{ width: '100%', height: 'auto' }}
        />
      );

      return (
        <Col lg={colSize} md={colSize === 6 ? 6 : 12} className="mb-4" key={`gallery-${index}`}>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ overflow: 'hidden', cursor: 'pointer' }}
          >
            {content}
            {item.caption && (
              <p className="text-center mt-2 text-muted small">{item.caption}</p>
            )}
          </motion.div>
        </Col>
      );
    };

    return (
      <Row className="sec_sp">
        <Col lg="12">
          <motion.h3 variants={itemVariants} className="color_sec py-4 text-center">
            Project Gallery
          </motion.h3>
        </Col>
        <Col lg="12">
          <Row>
            {galleryItems.map((item, index) => {
              // Dynamic layout pattern for visual interest
              if (index === 0) {
                // First image: full width
                return renderGalleryItem(item, index, 12);
              } else if (index === 1 || index === 2) {
                // Next two: half width
                return renderGalleryItem(item, index, 6);
              } else if (index === 3) {
                // Fourth: full width
                return renderGalleryItem(item, index, 12);
              } else {
                // Remaining: half width
                return renderGalleryItem(item, index, 6);
              }
            })}
          </Row>
        </Col>
      </Row>
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

      {renderHero()}

      <motion.div
        className="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
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
            {/* Gallery images are now mixed into sections automatically */}
            {renderMetadata()}
          </motion.div>
        </Container>
        <ReturnToPortfolio />
      </motion.div>
    </HelmetProvider>
  );
};

export default DynamicProjectPage;
