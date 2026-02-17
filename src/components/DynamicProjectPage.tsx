import React, { useEffect, useRef, useState } from "react";
import { useParams, Navigate, Link } from "@tanstack/react-router";
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
        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Breadcrumb Skeleton */}
          <div className="breadcrumbs mb-8">
            <ul>
              <li>
                <div className="skeleton h-4 w-16"></div>
              </li>
              <li>
                <div className="skeleton h-4 w-20"></div>
              </li>
              <li>
                <div className="skeleton h-4 w-32"></div>
              </li>
            </ul>
          </div>

          {/* Hero Skeleton */}
          <div className="skeleton h-[50vh] w-full mb-8"></div>

          {/* Title Skeleton */}
          <div className="skeleton h-12 w-2/3 mb-4"></div>
          <div className="skeleton h-6 w-1/2 mb-4"></div>

          {/* Tags Skeleton */}
          <div className="flex gap-2 mb-8">
            <div className="skeleton h-6 w-20"></div>
            <div className="skeleton h-6 w-24"></div>
            <div className="skeleton h-6 w-16"></div>
          </div>

          {/* Content Skeleton */}
          <div className="space-y-4">
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-3/4"></div>
          </div>

          {/* Loading Indicator */}
          <div className="flex items-center justify-center py-8">
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

  // Parse technologies into tags
  const getTags = (): string[] => {
    if (!project.metadata?.technologies) return [];
    return project.metadata.technologies
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  };

  const renderBreadcrumbs = () => (
    <div className="breadcrumbs text-sm mb-6 pt-20">
      <ul>
        <li>
          <Link
            to="/"
            className="font-mono text-xs uppercase tracking-wider text-base-content/50 hover:text-base-content transition-colors flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/portfolio"
            className="font-mono text-xs uppercase tracking-wider text-base-content/50 hover:text-base-content transition-colors flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Portfolio
          </Link>
        </li>
        <li>
          <span className="font-mono text-xs uppercase tracking-wider text-base-content">
            {project.title}
          </span>
        </li>
      </ul>
    </div>
  );

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

    const tags = getTags();

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

          {/* Technology Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {tags.slice(0, 5).map((tag, idx) => (
                <span
                  key={idx}
                  className="badge badge-outline badge-sm font-mono text-xs uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 5 && (
                <span className="badge badge-ghost badge-sm font-mono text-xs">
                  +{tags.length - 5} more
                </span>
              )}
            </div>
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

      {/* Breadcrumbs - only show if no hero */}
      {!project.hero && (
        <div className="container mx-auto max-w-6xl px-4">
          {renderBreadcrumbs()}
        </div>
      )}

      {renderHero()}

      <motion.div
        className="main-content container mx-auto max-w-6xl px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Breadcrumbs - show after hero if hero exists */}
        {project.hero && renderBreadcrumbs()}

        {renderMetadataBar()}

        {/* Project Action Links */}
        {(project.link || project.github) && (
          <motion.div
            className="flex flex-wrap gap-4 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline font-mono text-xs uppercase tracking-wider gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Visit Live Site
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline font-mono text-xs uppercase tracking-wider gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
              </a>
            )}
          </motion.div>
        )}

        {renderSections()}
        {renderGallery()}
        {renderDetails()}
        <ReturnToPortfolio />
      </motion.div>
    </HelmetProvider>
  );
};

export default DynamicProjectPage;
