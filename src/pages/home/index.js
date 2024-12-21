import React, { useEffect, useMemo } from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Typewriter from "typewriter-effect";
import { introdata, meta, dataportfolio, socialprofils } from "../../content_option";
import { Link } from "react-router-dom";
import PortfolioItem from "../../components/PortfolioItem";
import { motion, useScroll, useTransform } from "framer-motion";

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

  const randomizedStrings = useMemo(() => {
    const strings = Object.values(introdata.animated);
    return strings.sort(() => Math.random() - 0.5);
  }, []);

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
              autoPlay
              loop
              muted
              playsInline
              className="hero-video"
            >
              <source src="https://oculair.b-cdn.net/api/v1/videos/29d980a5d2fff954196daf60232e7072ebac9752/3rjei659/avc" type="video/mp4" />
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
              <motion.h1 variants={itemVariants}>
                <Typewriter
                  options={{
                    strings: randomizedStrings,
                    autoStart: true,
                    loop: true,
                    deleteSpeed: 20, // Reduced from 30 to 20
                    delay: 100, // Reduced from 150 to 100
                    wrapperClassName: "Typewriter__wrapper rainbow-text",
                    cursorClassName: "Typewriter__cursor",
                    typeSpeed: (index) => {
                      const baseSpeed = 50; // Reduced from 70 to 50
                      const variableSpeed = Math.floor(Math.random() * 40) - 20; // Reduced range from -30 to +30 to -20 to +20
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
                    My Portfolio
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
                    Contact Me
                    <div className="ring one"></div>
                    <div className="ring two"></div>
                    <div className="ring three"></div>
                  </motion.div>
                </Link>
              </motion.div>
              <motion.div className="social-icons" variants={itemVariants}>
                {socialprofils.linkedin && (
                  <SocialIcon href={socialprofils.linkedin}>
                    <i className="fab fa-linkedin"></i>
                  </SocialIcon>
                )}
                {socialprofils.github && (
                  <SocialIcon href={socialprofils.github}>
                    <i className="fab fa-github"></i>
                  </SocialIcon>
                )}
                {socialprofils.twitter && (
                  <SocialIcon href={socialprofils.twitter}>
                    <i className="fab fa-twitter"></i>
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
            Featured Projects
          </motion.h2>
          <div className="portfolio_items">
            {dataportfolio.slice(0, 3).map((data, i) => (
              <PortfolioItem key={i} data={data} />
            ))}
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
                View All Projects
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
