import React, { useEffect, useMemo, useState, memo, useCallback } from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Typewriter from "typewriter-effect";
import { meta, socialprofils, uiText } from "../../content_option";
import { getHomeIntro, getPortfolioItems } from "../../utils/payloadApi";
import { Link } from "@tanstack/react-router";
import PortfolioItem from "../../components/PortfolioItem";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";
import {
  usePrefetchCriticalData,
  usePrefetchPortfolio,
} from "../../hooks/useDataPrefetch";
import type {
  TransformedIntroData,
  PortfolioItem as PortfolioItemType,
} from "../../types";

interface SocialIconProps {
  href: string;
  label: string;
  children: React.ReactNode;
}

const SocialIcon = memo<SocialIconProps>(({ href, label, children }) => (
  <div className="tooltip tooltip-bottom" data-tip={label}>
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="btn btn-ghost btn-square btn-sm border border-base-content/20 text-base-content/60 hover:text-base-content hover:border-base-content/40 hover:bg-base-content/5 transition-all duration-200"
    >
      {children}
    </a>
  </div>
));

SocialIcon.displayName = "SocialIcon";

// Skeleton Components using daisyUI
const HomeIntroSkeleton = memo(() => (
  <div className="hero-container">
    {/* Video Skeleton */}
    <div className="hero-media">
      <div className="skeleton w-full h-full"></div>
    </div>

    {/* Text Skeleton */}
    <div className="hero-content">
      <div className="hero-text">
        <div className="skeleton h-5 w-40 mb-4"></div>
        <div className="skeleton h-16 w-full max-w-lg mb-6"></div>
        <div className="skeleton h-4 w-full mb-2"></div>
        <div className="skeleton h-4 w-3/4 mb-8"></div>
        <div className="flex gap-3 mb-8">
          <div className="skeleton h-12 w-36"></div>
          <div className="skeleton h-12 w-36"></div>
        </div>
        <div className="flex gap-3">
          <div className="skeleton w-10 h-10"></div>
          <div className="skeleton w-10 h-10"></div>
          <div className="skeleton w-10 h-10"></div>
        </div>
      </div>
    </div>
  </div>
));

HomeIntroSkeleton.displayName = "HomeIntroSkeleton";

const PortfolioGridSkeleton = memo<{ count?: number }>(({ count = 3 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="skeleton aspect-[4/3] w-full"></div>
    ))}
  </>
));

PortfolioGridSkeleton.displayName = "PortfolioGridSkeleton";

export const Home = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [introdata, setIntroData] = useState<TransformedIntroData | null>(null);
  const [dataportfolio, setDataPortfolio] = useState<PortfolioItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [homeIntroData, portfolioData] = await Promise.all([
          getHomeIntro(),
          getPortfolioItems({ limit: 3 }),
        ]);

        const transformedIntroData: TransformedIntroData = {
          title: homeIntroData.title,
          description: homeIntroData.description,
          your_img_url: homeIntroData.image_url,
          animated: homeIntroData.animated.reduce(
            (
              acc: Record<string, string>,
              item: { text: string },
              index: number,
            ) => {
              const keys = [
                "first",
                "second",
                "third",
                "fourth",
                "fifth",
                "sixth",
                "seventh",
                "eighth",
                "ninth",
                "tenth",
              ];
              if (index < keys.length) {
                acc[keys[index]] = item.text;
              }
              return acc;
            },
            {},
          ),
        };

        setIntroData(transformedIntroData);
        setDataPortfolio(portfolioData);
      } catch {
        const module = await import("../../content_option");
        setIntroData(module.introdata);
        setDataPortfolio(module.dataportfolio);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  usePrefetchCriticalData(["portfolio", "about"]);

  const portfolioHoverHandlers = usePrefetchPortfolio();

  const randomizedStrings = useMemo(() => {
    if (!introdata?.animated) return [];
    const strings = Object.values(introdata.animated);
    return strings.sort(() => Math.random() - 0.5);
  }, [introdata]);

  const portfolioItems = useMemo(() => {
    if (!dataportfolio || dataportfolio.length === 0) return null;
    return dataportfolio.map((data, i) => (
      <PortfolioItem key={data.id || i} data={data} index={i} />
    ));
  }, [dataportfolio]);

  const handlePortfolioClick = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  if (loading || !introdata) {
    return (
      <HelmetProvider>
        <section id="home" className="home-section">
          <Helmet>
            <meta charSet="utf-8" />
            <title>{meta.title}</title>
            <meta name="description" content={meta.description} />
          </Helmet>

          <HomeIntroSkeleton />

          <section className="portfolio-section">
            <div className="portfolio-container">
              <div className="skeleton h-10 w-64 mb-10"></div>
              <div className="portfolio-grid">
                <PortfolioGridSkeleton count={3} />
              </div>
            </div>
          </section>
        </section>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <section id="home" className="home-section">
        <Helmet>
          <meta charSet="utf-8" />
          <title>{meta.title}</title>
          <meta name="description" content={meta.description} />
        </Helmet>

        {/* Hero Section */}
        <div className="hero-container">
          {/* Video/Media Side */}
          <div className="hero-media">
            <video
              ref={(el) => {
                if (el) {
                  el.playsInline = true;
                  el.muted = true;
                  el.loop = true;
                  el.autoplay = true;
                  el.load();
                  el.addEventListener("error", () => {
                    el.load();
                    el.play().catch(() => {});
                  });
                  el.addEventListener("ended", () => {
                    el.currentTime = 0;
                    el.play().catch(() => {});
                  });
                  const playPromise = el.play();
                  if (playPromise !== undefined) {
                    playPromise
                      .then(() => {
                        setVideoLoaded(true);
                      })
                      .catch(() => {
                        setTimeout(() => {
                          el.play().catch(() => {});
                        }, 1000);
                      });
                  }
                }
              }}
              onLoadedData={() => setVideoLoaded(true)}
              className={`hero-video ${videoLoaded ? "loaded" : ""}`}
              preload="metadata"
            >
              <source
                src="https://oculair.b-cdn.net/downloads/title.avc"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Text Content Side */}
          <div className="hero-content">
            <div className="hero-text">
              {/* Subtitle */}
              <h2 className="hero-subtitle animate-fade-in-up">
                {introdata.title}
              </h2>

              {/* Typewriter Title */}
              <div className="hero-typewriter animate-fade-in-up delay-1">
                <Typewriter
                  options={{
                    strings: randomizedStrings,
                    autoStart: true,
                    loop: true,
                    deleteSpeed: 20,
                    delay: 100,
                    wrapperClassName: "typewriter-text",
                    cursorClassName: "typewriter-cursor",
                  }}
                />
              </div>

              {/* Description */}
              <p className="hero-description animate-fade-in-up delay-2">
                {introdata.description}
              </p>

              {/* CTA Buttons */}
              <div className="hero-buttons animate-fade-in-up delay-3">
                <Link
                  to="/portfolio"
                  {...portfolioHoverHandlers}
                  onClick={handlePortfolioClick}
                >
                  <button className="btn btn-primary">
                    {uiText.myPortfolio}
                  </button>
                </Link>
                <a
                  href="#contact-footer"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("contact-footer")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <button className="btn btn-outline">
                    {uiText.contactMe}
                  </button>
                </a>
              </div>

              {/* Social Icons with Tooltips */}
              <div className="hero-social animate-fade-in-up delay-4">
                {socialprofils.linkedin && (
                  <SocialIcon href={socialprofils.linkedin} label="LinkedIn">
                    <FaLinkedin className="text-lg" />
                  </SocialIcon>
                )}
                {socialprofils.github && (
                  <SocialIcon href={socialprofils.github} label="GitHub">
                    <FaGithub className="text-lg" />
                  </SocialIcon>
                )}
                {socialprofils.twitter && (
                  <SocialIcon href={socialprofils.twitter} label="Twitter / X">
                    <FaTwitter className="text-lg" />
                  </SocialIcon>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Portfolio Section */}
      <motion.section
        id="portfolio"
        className="portfolio-section"
        style={{ opacity }}
      >
        <div className="portfolio-container">
          {/* Section Header */}
          <div className="text-center mb-10">
            <span className="badge badge-primary badge-lg font-mono text-xs uppercase tracking-wider mb-4">
              Selected Work
            </span>
            <h2 className="portfolio-title">{uiText.featuredProjects}</h2>
            <p className="font-mono text-sm text-base-content/50 uppercase tracking-wider max-w-xl mx-auto">
              A curated selection of recent projects showcasing my expertise in
              creative technology and immersive experiences
            </p>
          </div>

          {/* Portfolio Grid */}
          <div className="portfolio-grid">
            {portfolioItems || (
              <div className="col-span-full text-center py-10">
                <div className="alert alert-info max-w-md mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span className="font-mono text-sm">
                    No projects available
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="portfolio-cta">
            <Link
              to="/portfolio"
              {...portfolioHoverHandlers}
              onClick={handlePortfolioClick}
            >
              <button className="btn btn-primary btn-lg gap-2">
                {uiText.viewAllProjects}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </motion.section>
    </HelmetProvider>
  );
};
