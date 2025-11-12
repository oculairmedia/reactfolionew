import React, { useEffect, useMemo, useState } from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Typewriter from "typewriter-effect";
import { meta, socialprofils, uiText } from "../../content_option";
import { getHomeIntro, getPortfolioItems, getSiteSettings } from "../../utils/payloadApi";
import { Link } from "react-router-dom";
import PortfolioItem from "../../components/PortfolioItem";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaLinkedin, FaGithub, FaTwitter } from 'react-icons/fa';
import { HomeIntroSkeleton, PortfolioGridSkeleton, Skeleton } from "../../components/SkeletonLoader";
import { usePrefetchCriticalData, usePrefetchPortfolio, usePrefetchAbout } from "../../hooks/useDataPrefetch";

const SocialIcon = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="social-icon"
  >
    {children}
  </a>
);

export const Home = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [introdata, setIntroData] = useState(null);
  const [dataportfolio, setDataPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  useEffect(() => {
    const addMinimalScrollbar = () => {
      const style = document.createElement('style');
      style.textContent = `
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.4);
        }
        body {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.1);
        }
      `;
      document.head.appendChild(style);
    };

    addMinimalScrollbar();
  }, []);

  // Fetch data from CMS
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [homeIntroData, portfolioData] = await Promise.all([
          getHomeIntro(),
          getPortfolioItems({ limit: 3 })
        ]);

        // Transform home intro data to match expected format
        const transformedIntroData = {
          title: homeIntroData.title,
          description: homeIntroData.description,
          your_img_url: homeIntroData.image_url,
          animated: homeIntroData.animated.reduce((acc, item, index) => {
            const keys = [
              'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'
            ];
            if (index < keys.length) {
              acc[keys[index]] = item.text;
            }
            return acc;
          }, {})
        };

        setIntroData(transformedIntroData);
        setDataPortfolio(portfolioData);
      } catch (error) {
        console.error('Error fetching CMS data:', error);
        // Fallback to static data if CMS fails
        import('../../content_option').then(module => {
          setIntroData(module.introdata);
          setDataPortfolio(module.dataportfolio);
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prefetch critical data on idle (after home page loads)
  // This will populate the cache for portfolio and about pages
  usePrefetchCriticalData(['portfolio', 'about']);

  // Get hover prefetch handlers
  const portfolioHoverHandlers = usePrefetchPortfolio();
  const aboutHoverHandlers = usePrefetchAbout();

  const randomizedStrings = useMemo(() => {
    if (!introdata?.animated) return [];
    const strings = Object.values(introdata.animated);
    return strings.sort(() => Math.random() - 0.5);
  }, [introdata]);

  // Removed motion variants - using CSS animations instead for better performance

  // Show skeleton while fetching data
  if (loading || !introdata) {
    return (
      <HelmetProvider>
        <section id="home" className="home">
          <Helmet>
            <meta charSet="utf-8" />
            <title> {meta.title}</title>
            <meta name="description" content={meta.description} />
          </Helmet>
          <div className="intro_sec skeleton-container">
            <HomeIntroSkeleton />
          </div>
          <section id="portfolio" className="portfolio_section skeleton-container">
            <div className="container">
              <Skeleton height="48px" width="300px" className="section_title" style={{ margin: '0 auto 40px', display: 'block' }} />
              <div className="portfolio_items">
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
      <section id="home" className="home">
        <Helmet>
          <meta charSet="utf-8" />
          <title> {meta.title}</title>
          <meta name="description" content={meta.description} />
        </Helmet>
        <div className="intro_sec content-container">
          <div className="h_bg-video">
            <video
              ref={(el) => {
                if (el) {
                  el.playsInline = true;
                  el.muted = true;
                  el.loop = true;
                  el.autoplay = true;
                  // Force load and play
                  el.load();
                  // Add error handling for video playback
                  el.addEventListener('error', (e) => {
                    console.error('Video error:', e);
                    // Try to recover by reloading the video
                    el.load();
                    el.play().catch(console.error);
                  });
                  // Add ended event listener to ensure looping
                  el.addEventListener('ended', () => {
                    el.currentTime = 0;
                    el.play().catch(console.error);
                  });
                  const playPromise = el.play();
                  if (playPromise !== undefined) {
                    playPromise
                      .then(() => {
                        setVideoLoaded(true);
                      })
                      .catch(error => {
                        console.log("Video autoplay failed:", error);
                        // Try to play again after a short delay
                        setTimeout(() => {
                          el.play().catch(e => console.log("Retry failed:", e));
                        }, 1000);
                      });
                  }
                }
              }}
              onLoadedData={() => setVideoLoaded(true)}
              className={`hero-video ${videoLoaded ? 'loaded' : ''}`}
              preload="metadata"
            >
              <source
                src="https://oculair.b-cdn.net/downloads/title.avc"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="text">
            <div className="intro">
              <h2 className="animate-item" style={{ animation: 'fadeInUp 0.3s ease forwards' }}>
                {introdata.title}
              </h2>
              <h1 className="typewriter-container animate-item" style={{ animation: 'fadeInUp 0.3s ease forwards', animationDelay: '0.2s', opacity: 0 }}>
                <Typewriter
                  options={{
                    strings: randomizedStrings,
                    autoStart: true,
                    loop: true,
                    deleteSpeed: 20,
                    delay: 100,
                    wrapperClassName: "Typewriter__wrapper rainbow-text",
                    cursorClassName: "Typewriter__cursor",
                    typeSpeed: (index) => {
                      const baseSpeed = 50;
                      const variableSpeed = Math.floor(Math.random() * 40) - 20;
                      return Math.max(10, baseSpeed + variableSpeed);
                    },
                  }}
                />
              </h1>
              <p className="animate-item" style={{ animation: 'fadeInUp 0.3s ease forwards', animationDelay: '0.4s', opacity: 0 }}>
                {introdata.description}
              </p>
              <div className="intro_btn-action animate-item" style={{ animation: 'fadeInUp 0.3s ease forwards', animationDelay: '0.6s', opacity: 0 }}>
                <Link to="/portfolio" className="text_2" {...portfolioHoverHandlers} onClick={() => { window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); }}>
                  <div id="button_p" className="ac_btn btn">
                    {uiText.myPortfolio}
                    <div className="ring one"></div>
                    <div className="ring two"></div>
                    <div className="ring three"></div>
                  </div>
                </Link>
                <Link to="/contact">
                  <div id="button_h" className="ac_btn btn">
                    {uiText.contactMe}
                    <div className="ring one"></div>
                    <div className="ring two"></div>
                    <div className="ring three"></div>
                  </div>
                </Link>
              </div>
              <div className="social-icons animate-item" style={{ animation: 'fadeInUp 0.3s ease forwards', animationDelay: '0.8s', opacity: 0 }}>
                {socialprofils.linkedin && (
                  <SocialIcon href={socialprofils.linkedin}>
                    <FaLinkedin />
                  </SocialIcon>
                )}
                {socialprofils.github && (
                  <SocialIcon href={socialprofils.github}>
                    <FaGithub />
                  </SocialIcon>
                )}
                {socialprofils.twitter && (
                  <SocialIcon href={socialprofils.twitter}>
                    <FaTwitter />
                  </SocialIcon>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <motion.section
        id="portfolio"
        className="portfolio_section content-container"
        style={{ opacity }}
      >
        <div className="container">
          <h2 className="section_title animate">
            {uiText.featuredProjects}
          </h2>
          <div className="portfolio_items">
            {dataportfolio && dataportfolio.length > 0 ? (
              dataportfolio.map((data, i) => (
                <PortfolioItem key={data.id || i} data={data} />
              ))
            ) : (
              <div>No projects available</div>
            )}
          </div>
          <div className="view_all_btn animate">
            <Link to="/portfolio" className="text_2" {...portfolioHoverHandlers} onClick={() => { window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); }}>
              <div id="button_p" className="ac_btn btn">
                {uiText.viewAllProjects}
                <div className="ring one"></div>
                <div className="ring two"></div>
                <div className="ring three"></div>
              </div>
            </Link>
          </div>
        </div>
      </motion.section>
    </HelmetProvider>
  );
};
