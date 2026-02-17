import React, { useEffect, useRef, useState } from "react";
import { useParams, Navigate } from "@tanstack/react-router";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { meta } from "../content_option";
import { getProjectById } from "../utils/payloadApi";
import ReturnToPortfolio from "./ReturnToPortfolio";
import GalleryMedia, { normalizeGalleryItem } from "./GalleryMedia";
import type { Project, NormalizedGalleryItem } from "../types";
import "./ProjectPage.css";

type ProjectModule = { default?: Project } & Record<string, unknown>;
const projectModules: Record<string, ProjectModule> = import.meta.glob(
  "../content/projects/*.json",
  { eager: true },
);

function getLocalProject(slug: string): Project | null {
  for (const [path, module] of Object.entries(projectModules)) {
    const id = path.replace(/^.*\//, "").replace(".json", "");
    if (id === slug) return (module.default || module) as Project;
  }
  return null;
}

const DynamicProjectPage = () => {
  const { slug } = useParams({ strict: false });
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const videoRefs = useRef<HTMLVideoElement[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProject = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const projectData = await getProjectById(slug as string);

        if (projectData) {
          setProject(projectData);
        } else {
          const localProject = getLocalProject(slug as string);
          if (localProject) {
            setProject(localProject);
          } else {
            setNotFound(true);
          }
        }
      } catch {
        const localProject = getLocalProject(slug as string);
        if (localProject) {
          setProject(localProject);
        } else {
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
        ref.addEventListener("loadeddata", () => {});
        ref.addEventListener("error", () => {});
      }
    });
  }, [project]);

  if (loading) {
    return (
      <HelmetProvider>
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-center py-16">
            <span className="loading loading-spinner loading-lg"></span>
            <span className="ml-4 font-mono text-sm uppercase tracking-wider text-base-content/60">
              Loading project...
            </span>
          </div>
        </div>
      </HelmetProvider>
    );
  }

  if (notFound || !project) {
    return <Navigate to="/portfolio" replace />;
  }

  const registerVideoRef = (el: HTMLVideoElement) => {
    if (el && !videoRefs.current.includes(el)) {
      videoRefs.current.push(el);
    }
  };

  const galleryItems: NormalizedGalleryItem[] = (project.gallery || []).map(
    normalizeGalleryItem,
  );

  const fadeUp = {
    hidden: { opacity: 0, y: 25 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, delay: i * 0.12, ease: "easeOut" },
    }),
  };

  const imageReveal = {
    hidden: { filter: "grayscale(100%)", opacity: 0.8 },
    visible: {
      filter: "grayscale(0%)",
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

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
          className="w-full h-full object-cover"
        >
          <source src={project.hero.video} type="video/mp4" />
        </video>
      ) : project.hero.type === "image" && project.hero.image ? (
        <img
          src={project.hero.image}
          alt={project.hero.alt || project.title}
          className="w-full h-full object-cover"
        />
      ) : null;

    if (!heroMedia) return null;

    return (
      <div className="project-hero">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full"
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
            <p className="project-hero-eyebrow font-mono text-[0.7rem] uppercase tracking-[0.2em] text-base-content/60 mb-4">
              {project.metadata.exhibition}
            </p>
          )}
          <h1 className="project-hero-title font-heading text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-base-content">
            {project.title}
          </h1>
          <div className="project-hero-divider w-24 h-[2px] bg-base-content/30 my-6" />
          {project.subtitle && (
            <p className="project-hero-subtitle font-mono text-sm uppercase tracking-wider text-base-content/70 max-w-2xl">
              {project.subtitle}
            </p>
          )}
        </motion.div>

        <motion.div
          className="project-scroll-hint absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-base-content/50">
            Scroll
          </span>
          <div className="project-scroll-line w-[1px] h-8 bg-base-content/30" />
        </motion.div>
      </div>
    );
  };

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
    ].filter(Boolean) as Array<{ label: string; value: string }>;

    if (items.length === 0) return null;

    return (
      <motion.div
        className="project-meta-bar grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y-2 border-base-content/10 my-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
      >
        {items.map((item, i) => (
          <motion.div key={i} className="project-meta-item" variants={fadeUp}>
            <div className="project-meta-label font-mono text-[0.6rem] uppercase tracking-[0.15em] text-base-content/50 mb-1">
              {item.label}
            </div>
            <div className="project-meta-value font-body text-sm text-base-content">
              {item.value}
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const renderSections = () => {
    if (!project.sections || project.sections.length === 0) return null;

    let imageIndex = 0;

    return project.sections.map((section, index) => {
      const hasImage = imageIndex < galleryItems.length;

      if (!hasImage || index % 3 === 2) {
        return (
          <motion.div
            key={`section-${index}`}
            className="project-section-full py-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <h3 className="project-section-title font-heading text-2xl md:text-3xl font-bold uppercase tracking-tight text-base-content mb-6">
              {section.title}
            </h3>
            <div className="section-content prose prose-invert max-w-none font-body text-base-content/80 leading-relaxed">
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>
          </motion.div>
        );
      }

      const isReverse = index % 2 === 1;
      const currentImage = galleryItems[imageIndex];
      imageIndex++;

      return (
        <motion.div
          key={`section-${index}`}
          className={`project-section-row grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 py-12 ${
            isReverse ? "lg:[&>*:first-child]:order-2" : ""
          }`}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          <motion.div className="section-text" variants={fadeUp}>
            <h3 className="project-section-title font-heading text-2xl md:text-3xl font-bold uppercase tracking-tight text-base-content mb-6">
              {section.title}
            </h3>
            <div className="section-content prose prose-invert max-w-none font-body text-base-content/80 leading-relaxed">
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>
          </motion.div>
          <motion.div
            className="project-section-image"
            variants={imageReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
          >
            <GalleryMedia
              item={currentImage}
              registerVideoRef={registerVideoRef}
              className="w-full h-auto"
            />
          </motion.div>
        </motion.div>
      );
    });
  };

  const renderGallery = () => {
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
        className="project-gallery py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.h3
          className="project-gallery-title font-heading text-2xl md:text-3xl font-bold uppercase tracking-tight text-base-content mb-10"
          variants={fadeUp}
        >
          Gallery
        </motion.h3>
        <div className="project-gallery-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {remainingItems.map((item, idx) => (
            <motion.div
              key={`gallery-${idx}`}
              className="project-gallery-item group relative overflow-hidden"
              variants={imageReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-5%" }}
              whileHover={{ scale: 1.02 }}
            >
              <GalleryMedia
                item={item}
                registerVideoRef={registerVideoRef}
                className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
              />
              {item.caption && (
                <div className="gallery-caption absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-base-100/90 to-transparent">
                  <p className="font-mono text-[0.65rem] uppercase tracking-wider text-base-content/70">
                    {item.caption}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

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
    ].filter(Boolean) as Array<{ label: string; value: string }>;

    if (details.length === 0) return null;

    return (
      <motion.div
        className="project-details py-16 border-t-2 border-base-content/10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
      >
        <motion.h3
          className="project-section-title font-heading text-2xl md:text-3xl font-bold uppercase tracking-tight text-base-content mb-10"
          variants={fadeUp}
        >
          Project Details
        </motion.h3>
        <div className="project-details-grid grid grid-cols-2 md:grid-cols-3 gap-6">
          {details.map((d, i) => (
            <motion.div
              key={i}
              className="project-detail-card p-4 border-2 border-base-content/10"
              variants={fadeUp}
            >
              <div className="project-meta-label font-mono text-[0.6rem] uppercase tracking-[0.15em] text-base-content/50 mb-1">
                {d.label}
              </div>
              <div className="project-meta-value font-body text-sm text-base-content">
                {d.value}
              </div>
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
        className="main-content container mx-auto max-w-6xl px-4 py-8"
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
