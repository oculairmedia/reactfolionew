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

const SocialIcon = ({ href, children }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="social-icon"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
    {children}
  </motion.a>
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

  const randomizedStrings = useMemo(() => {
    if (!introdata?.animated) return [];
    const strings = Object.values(introdata.animated);
    return strings.sort(() => Math.random() - 0.5);
  }, [introdata]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2 // Reduced from 0.3 to 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3 // Reduced from 0.5 to 0.3
      }
    }
  };

  // Show loading state while fetching data
  if (loading || !introdata) {
    return (
      <HelmetProvider>
        <div className="home" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Loading...</div>
        </div>
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
        <div className="intro_sec">
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
          <motion.div
            className="text"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="intro">
              <motion.h2 variants={itemVariants}>{introdata.title}</motion.h2>
              <motion.h1 variants={itemVariants} className="typewriter-container">
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
              </motion.h1>
              <motion.p variants={itemVariants}>{introdata.description}</motion.p>
              <motion.div className="intro_btn-action" variants={itemVariants}>
                <Link to="/portfolio" className="text_2">
                  <motion.div
                    id="button_p"
                    className="ac_btn btn"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {uiText.myPortfolio}
                    <div className="ring one"></div>
                    <div className="ring two"></div>
                    <div className="ring three"></div>
                  </motion.div>
                </Link>
                <Link to="/contact">
                  <motion.div
                    id="button_h"
                    className="ac_btn btn"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {uiText.contactMe}
                    <div className="ring one"></div>
                    <div className="ring two"></div>
                    <div className="ring three"></div>
                  </motion.div>
                </Link>
              </motion.div>
              <motion.div className="social-icons" variants={itemVariants}>
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
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      <motion.section
        id="portfolio"
        className="portfolio_section"
        style={{ opacity }}
      >
        <div className="container">
          <motion.h2
            className="section_title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }} // Reduced duration from 0.5 to 0.3 and delay from 0.7 to 0.4
          >
            {uiText.featuredProjects}
          </motion.h2>
          <div className="portfolio_items">
            {dataportfolio && dataportfolio.length > 0 ? (
              dataportfolio.map((data, i) => (
                <PortfolioItem key={data.id || i} data={data} />
              ))
            ) : (
              <div>No projects available</div>
            )}
          </div>
          <motion.div
            className="view_all_btn"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }} // Reduced duration from 0.5 to 0.3 and delay from 0.9 to 0.5
          >
            <Link to="/portfolio" className="text_2">
              <motion.div
                id="button_p"
                className="ac_btn btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {uiText.viewAllProjects}
                <div className="ring one"></div>
                <div className="ring two"></div>
                <div className="ring three"></div>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </HelmetProvider>
  );
};
