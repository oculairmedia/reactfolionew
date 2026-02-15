import React, { useEffect, useRef, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container } from "react-bootstrap";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { meta } from "../content_option";
import { getProjectById } from "../utils/payloadApi";
import ReturnToPortfolio from "./ReturnToPortfolio";
import GalleryMedia, { normalizeGalleryItem } from "./GalleryMedia";
import "./ProjectPage.css";

const DynamicProjectPage = () => {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const videoRefs = useRef([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProject = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const projectData = await getProjectById(slug);

        if (projectData) {
          setProject(projectData);
        } else {
          const projectContext = require.context(
            "../content/projects",
            false,
            /\.json$/,
          );
          const allProjects = {};
          projectContext.keys().forEach((key) => {
            const projectId = key.replace("./", "").replace(".json", "");
            allProjects[projectId] = projectContext(key);
          });

          if (allProjects[slug]) {
            setProject(allProjects[slug]);
          } else {
            setNotFound(true);
          }
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        try {
          const projectContext = require.context(
            "../content/projects",
            false,
            /\.json$/,
          );
          const allProjects = {};
          projectContext.keys().forEach((key) => {
            const projectId = key.replace("./", "").replace(".json", "");
            allProjects[projectId] = projectContext(key);
          });

          if (allProjects[slug]) {
            setProject(allProjects[slug]);
          } else {
            setNotFound(true);
          }
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError);
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  useEffect(() => {
    videoRefs.current.forEach((ref) => {
      if (ref) {
        ref.addEventListener("loadeddata", () => {
          console.log("Video loaded successfully");
        });
        ref.addEventListener("error", (e) => {
          console.error("Error loading video:", e);
        });
      }
    });
  }, [project]);

  if (loading) {
    return (
      <HelmetProvider>
        <Container className="content-wrapper">
          <div style={{ textAlign: "center", padding: "4rem" }}>
            Loading project...
          </div>
        </Container>
      </HelmetProvider>
    );
  }

  if (notFound || !project) {
    return <Navigate to="/portfolio" replace />;
  }

  const registerVideoRef = (el) => {
    if (el && !videoRefs.current.includes(el)) {
      videoRefs.current.push(el);
    }
  };

  const galleryItems = (project.gallery || []).map(normalizeGalleryItem);

  const fadeUp = {
    hidden: { opacity: 0, y: 25 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, delay: i * 0.12, ease: "easeOut" },
    }),
  };

  // ─── HERO ───
  const renderHero = () => {
    if (!project.hero) return null;

    const heroMedia =
      project.hero.type === "video" && project.hero.video ? (
        <video
          ref={registerVideoRef}
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={project.hero.video} type="video/mp4" />
        </video>
      ) : project.hero.type === "image" && project.hero.image ? (
        <img
          src={project.hero.image}
          alt={project.hero.alt || project.title}
        />
      ) : null;

    if (!heroMedia) return null;

    return (
      <div className="project-hero">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          {heroMedia}
        </motion.div>

        <motion.div
          className="project-hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {project.metadata?.exhibition && (
            <p className="project-hero-eyebrow">
              {project.metadata.exhibition}
            </p>
          )}
          <h1 className="project-hero-title">{project.title}</h1>
          <div className="project-hero-divider" />
          {project.subtitle && (
            <p className="project-hero-subtitle">{project.subtitle}</p>
          )}
        </motion.div>

        <motion.div
          className="project-scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <span>Scroll</span>
          <div className="project-scroll-line" />
        </motion.div>
      </div>
    );
  };

  // ─── METADATA BAR ───
  const renderMetadataBar = () => {
    if (!project.metadata) return null;
    const m = project.metadata;
    const items = [
      m.date && { label: "Date", value: m.date },
      m.client && { label: "Client", value: m.client },
      m.exhibition && { label: "Exhibition", value: m.exhibition },
      m.role && { label: "Role", value: m.role },
      m.collaborators && { label: "Team", value: m.collaborators },
      m.technologies && { label: "Medium", value: m.technologies },
      m.curators && { label: "Curators", value: m.curators },
    ].filter(Boolean);

    if (items.length === 0) return null;

    return (
      <motion.div
        className="project-meta-bar"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
      >
        {items.map((item, i) => (
          <motion.div
            key={i}
            className="project-meta-item"
            variants={fadeUp}
          >
            <div className="project-meta-label">{item.label}</div>
            <div className="project-meta-value">{item.value}</div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  // ─── CONTENT SECTIONS ───
  const renderSections = () => {
    if (!project.sections || project.sections.length === 0) return null;

    let imageIndex = 0;

    return project.sections.map((section, index) => {
      const hasImage = imageIndex < galleryItems.length;

      // Full-width section (no image available or every 3rd section)
      if (!hasImage || index % 3 === 2) {
        return (
          <motion.div
            key={`section-${index}`}
            className="project-section-full"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <h3 className="project-section-title">{section.title}</h3>
            <div className="section-content">
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>
          </motion.div>
        );
      }

      // Side-by-side: alternate image position
      const isReverse = index % 2 === 1;
      const currentImage = galleryItems[imageIndex];
      imageIndex++;

      return (
        <motion.div
          key={`section-${index}`}
          className={`project-section-row ${isReverse ? "reverse" : ""}`}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          <motion.div className="section-text" variants={fadeUp}>
            <h3 className="project-section-title">{section.title}</h3>
            <div className="section-content">
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>
          </motion.div>
          <motion.div
            className="project-section-image"
            variants={fadeUp}
          >
            <GalleryMedia
              item={currentImage}
              registerVideoRef={registerVideoRef}
            />
          </motion.div>
        </motion.div>
      );
    });
  };

  // ─── REMAINING GALLERY ───
  const renderGallery = () => {
    // Figure out how many images were used in sections
    const sectionsCount = (project.sections || []).length;
    let usedImages = 0;
    for (let i = 0; i < sectionsCount; i++) {
      if (i % 3 !== 2 && usedImages < galleryItems.length) {
        usedImages++;
      }
    }

    const remainingItems = galleryItems.slice(usedImages);
    if (remainingItems.length === 0) return null;

    return (
      <motion.div
        className="project-gallery"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.h3
          className="project-gallery-title"
          variants={fadeUp}
        >
          Gallery
        </motion.h3>
        <div className="project-gallery-grid">
          {remainingItems.map((item, idx) => (
            <motion.div
              key={`gallery-${idx}`}
              className="project-gallery-item"
              variants={fadeUp}
              whileHover={{ y: -4 }}
            >
              <GalleryMedia
                item={item}
                registerVideoRef={registerVideoRef}
              />
              {item.caption && (
                <div className="gallery-caption">{item.caption}</div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  // ─── DETAILS CARDS ───
  const renderDetails = () => {
    if (!project.metadata) return null;
    const m = project.metadata;
    const details = [
      m.date && { label: "Date", value: m.date },
      m.client && { label: "Client", value: m.client },
      m.role && { label: "Role", value: m.role },
      m.technologies && { label: "Technologies", value: m.technologies },
      m.collaborators && { label: "Collaborators", value: m.collaborators },
      m.curators && { label: "Curators", value: m.curators },
    ].filter(Boolean);

    if (details.length === 0) return null;

    return (
      <motion.div
        className="project-details"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
      >
        <motion.h3 className="project-section-title" variants={fadeUp}>
          Project Details
        </motion.h3>
        <div className="project-details-grid">
          {details.map((d, i) => (
            <motion.div
              key={i}
              className="project-detail-card"
              variants={fadeUp}
            >
              <div className="project-meta-label">{d.label}</div>
              <div className="project-meta-value">{d.value}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <HelmetProvider>
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          {project.title} | {meta.title}
        </title>
        <meta
          name="description"
          content={project.subtitle || meta.description}
        />
      </Helmet>

      {renderHero()}

      <motion.div
        className="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {renderMetadataBar()}
        {renderSections()}
        {renderGallery()}
        {renderDetails()}
        <ReturnToPortfolio />
      </motion.div>
    </HelmetProvider>
  );
};

export default DynamicProjectPage;
