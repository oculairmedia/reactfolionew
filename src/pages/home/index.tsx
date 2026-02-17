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
  usePrefetchAbout,
} from "../../hooks/useDataPrefetch";
import type {
  TransformedIntroData,
  PortfolioItem as PortfolioItemType,
} from "../../types";

interface SocialIconProps {
  href: string;
  children: React.ReactNode;
}

const SocialIcon = memo<SocialIconProps>(({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="btn btn-square btn-ghost btn-sm border border-base-content/20 hover:bg-base-content/10 hover:border-base-content/40 transition-all duration-150"
  >
    {children}
  </a>
));

SocialIcon.displayName = "SocialIcon";

// Skeleton Components using daisyUI
const HomeIntroSkeleton = memo(() => (
  <>
    <div className="w-full lg:w-[45%] h-[40vh] lg:h-full order-first lg:order-last">
      <div className="skeleton w-full h-full"></div>
    </div>
    <div className="w-full lg:w-[55%] p-4 lg:pl-[4%] flex justify-start items-start">
      <div className="max-w-[90%] lg:max-w-[90%] flex flex-col gap-4">
        <div className="skeleton h-6 w-48"></div>
        <div className="skeleton h-16 w-full max-w-md"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-3/4"></div>
        <div className="flex gap-3 mt-4">
          <div className="skeleton h-12 w-36"></div>
          <div className="skeleton h-12 w-36"></div>
        </div>
        <div className="flex gap-3 mt-6">
          <div className="skeleton w-9 h-9"></div>
          <div className="skeleton w-9 h-9"></div>
          <div className="skeleton w-9 h-9"></div>
        </div>
      </div>
    </div>
  </>
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
  const aboutHoverHandlers = usePrefetchAbout();

  const randomizedStrings = useMemo(() => {
    if (!introdata?.animated) return [];
    const strings = Object.values(introdata.animated);
    return strings.sort(() => Math.random() - 0.5);
  }, [introdata]);

  const portfolioItems = useMemo(() => {
    if (!dataportfolio || dataportfolio.length === 0) return null;
    return dataportfolio.map((data, i) => (
      <PortfolioItem key={data.id || i} data={data} />
    ));
  }, [dataportfolio]);

  const handlePortfolioClick = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  if (loading || !introdata) {
    return (
      <HelmetProvider>
        <section id="home" className="min-h-screen bg-base-100">
          <Helmet>
            <meta charSet="utf-8" />
            <title>{meta.title}</title>
            <meta name="description" content={meta.description} />
          </Helmet>
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-60px)] lg:min-h-[700px] -mt-[60px] items-center">
            <HomeIntroSkeleton />
          </div>
          <section className="py-20 bg-base-100 border-t-2 border-base-content/15">
            <div className="container mx-auto max-w-6xl px-4">
              <div className="skeleton h-12 w-72 mb-10"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5">
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
      <section id="home" className="min-h-screen bg-base-100">
        <Helmet>
          <meta charSet="utf-8" />
          <title>{meta.title}</title>
          <meta name="description" content={meta.description} />
        </Helmet>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-60px)] lg:min-h-[700px] -mt-[60px] items-center">
          {/* Text Content */}
          <div className="w-full lg:w-[55%] p-4 lg:pl-[4%] flex justify-start items-center order-last lg:order-first">
            <div className="max-w-[90%] flex flex-col">
              {/* Subtitle */}
              <h2 className="font-mono text-[0.7rem] font-normal uppercase tracking-[0.2em] text-base-content/60 mb-3 animate-[fadeInUp_0.3s_ease_forwards]">
                {introdata.title}
              </h2>

              {/* Typewriter */}
              <div
                className="h-[130px] overflow-hidden mb-5 animate-[fadeInUp_0.3s_ease_forwards_0.2s] opacity-0"
                style={{ animationFillMode: "forwards" }}
              >
                <Typewriter
                  options={{
                    strings: randomizedStrings,
                    autoStart: true,
                    loop: true,
                    deleteSpeed: 20,
                    delay: 100,
                    wrapperClassName:
                      "font-heading text-5xl md:text-6xl font-bold uppercase tracking-tighter leading-none text-base-content",
                    cursorClassName:
                      "text-5xl md:text-6xl font-bold text-base-content animate-[blink_0.6s_step-end_infinite]",
                  }}
                />
              </div>

              {/* Description */}
              <p
                className="font-mono text-[0.7rem] uppercase tracking-[0.08em] leading-relaxed text-base-content/60 mb-8 animate-[fadeInUp_0.3s_ease_forwards_0.4s] opacity-0"
                style={{ animationFillMode: "forwards" }}
              >
                {introdata.description}
              </p>

              {/* CTA Buttons */}
              <div
                className="flex flex-wrap gap-3 animate-[fadeInUp_0.3s_ease_forwards_0.6s] opacity-0"
                style={{ animationFillMode: "forwards" }}
              >
                <Link
                  to="/portfolio"
                  {...portfolioHoverHandlers}
                  onClick={handlePortfolioClick}
                >
                  <button className="btn btn-primary font-mono text-[0.7rem] uppercase tracking-[0.15em] px-7">
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
                  <button className="btn btn-outline font-mono text-[0.7rem] uppercase tracking-[0.15em] px-7">
                    {uiText.contactMe}
                  </button>
                </a>
              </div>

              {/* Social Icons */}
              <div
                className="flex gap-3 mt-8 animate-[fadeInUp_0.3s_ease_forwards_0.8s] opacity-0"
                style={{ animationFillMode: "forwards" }}
              >
                {socialprofils.linkedin && (
                  <SocialIcon href={socialprofils.linkedin}>
                    <FaLinkedin className="text-lg" />
                  </SocialIcon>
                )}
                {socialprofils.github && (
                  <SocialIcon href={socialprofils.github}>
                    <FaGithub className="text-lg" />
                  </SocialIcon>
                )}
                {socialprofils.twitter && (
                  <SocialIcon href={socialprofils.twitter}>
                    <FaTwitter className="text-lg" />
                  </SocialIcon>
                )}
              </div>
            </div>
          </div>

          {/* Video Background */}
          <div className="w-full lg:w-[45%] h-[40vh] lg:h-full min-h-[280px] lg:min-h-0 relative overflow-hidden order-first lg:order-last">
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
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 grayscale-[0.3] contrast-[1.1] ${
                videoLoaded ? "opacity-100" : "opacity-0"
              }`}
              preload="metadata"
            >
              <source
                src="https://oculair.b-cdn.net/downloads/title.avc"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <motion.section
        id="portfolio"
        className="py-20 bg-base-100 border-t-2 border-base-content/15"
        style={{ opacity }}
      >
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-tight text-left mb-10 text-base-content">
            {uiText.featuredProjects}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5 mb-10">
            {portfolioItems || (
              <div className="col-span-full text-center py-10 text-base-content/60">
                No projects available
              </div>
            )}
          </div>

          <div className="text-left">
            <Link
              to="/portfolio"
              {...portfolioHoverHandlers}
              onClick={handlePortfolioClick}
            >
              <button className="btn btn-primary font-mono text-[0.7rem] uppercase tracking-[0.15em] px-7">
                {uiText.viewAllProjects}
              </button>
            </Link>
          </div>
        </div>
      </motion.section>
    </HelmetProvider>
  );
};
