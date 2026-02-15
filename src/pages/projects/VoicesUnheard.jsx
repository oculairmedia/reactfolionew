import React, { useEffect, useRef } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Image } from "react-bootstrap";
import { meta } from "../../content_option";
import "./ProjectPage.css";
import "./VoicesUnheard.css";
import { motion, useScroll, useTransform } from "framer-motion";
import ReturnToPortfolio from "../../components/ReturnToPortfolio";

export const VoicesUnheard = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  // Removed heroOpacity to ensure visibility for debugging


  useEffect(() => {
    [videoRef1, videoRef2].forEach((ref) => {
      if (ref.current) {
        ref.current.addEventListener("loadeddata", () => {});
        ref.current.addEventListener("error", () => {});
      }
    });
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: i * 0.15, ease: "easeOut" },
    }),
  };

  return (
    <HelmetProvider>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Voices Unheard | {meta.title}</title>
        <meta name="description" content={meta.description} />
      </Helmet>

      <motion.div
        className="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* ─── HERO ─── */}
        <div className="vu-hero" ref={heroRef}>
          <motion.div style={{ scale: heroScale, width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
            <video
              ref={videoRef1}
              autoPlay
              loop
              muted
              playsInline
              poster="https://oculair.b-cdn.net/cache/images/dfa646d4fc64ddb3ec60a61e5dbd8e1e1be2f4dc.jpg"
            >
              <source
                src="https://oculair.b-cdn.net/api/v1/videos/bfbad3bf0b671badf4eb75634e9f15407ffd60ad/3rjei659/hevc"
                type="video/mp4"
              />
            </video>
          </motion.div>

          <motion.div className="vu-hero-content">
            <motion.p
              className="vu-hero-eyebrow"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Inter/Access IA 360° Showcase
            </motion.p>
            <motion.h1
              className="vu-hero-title"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Voices Unheard
            </motion.h1>
            <motion.div
              className="vu-hero-divider"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            />
            <motion.p
              className="vu-hero-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Reimagining sacred spaces through AI-generated imagery for marginalized communities
            </motion.p>
          </motion.div>

          <motion.div
            className="vu-scroll-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <span>Scroll</span>
            <div className="vu-scroll-line" />
          </motion.div>
        </div>

        {/* ─── METADATA BAR ─── */}
        <motion.div
          className="vu-meta-bar"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {[
            { label: "Date", value: "November 2023" },
            { label: "Exhibition", value: "Inter/Access IA 360°" },
            { label: "Team", value: "Johnston · Nolan · Umukoro" },
            { label: "Medium", value: "AI Imagery · Animation" },
          ].map((item, i) => (
            <motion.div className="vu-meta-item" key={i} variants={fadeUp} custom={i}>
              <div className="vu-meta-label">{item.label}</div>
              <div className="vu-meta-value">{item.value}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── CONCEPT ─── */}
        <motion.div
          className="vu-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
        >
          <motion.h2 className="vu-section-title" variants={fadeUp}>
            The Concept
          </motion.h2>
          <motion.p variants={fadeUp} custom={1}>
            <em>Voices Unheard: The Church and Marginalized Communities</em> is a
            video collaboration that is part of the Inter/Access IA 360° Showcase
            Exhibition. This project uses AI-generated imagery to create a new
            "church" for Indigenous, Queer, and POC folks, bringing together
            technology, art, and social commentary.
          </motion.p>
        </motion.div>

        {/* ─── STAINED-GLASS GALLERY ─── */}
        <motion.div
          className="vu-gallery"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.2 } } }}
        >
          <div className="vu-gallery-grid">
            {[
              "https://oculair.b-cdn.net/cache/images/a464a6d79ac0a23ba1e3dca4ed8f836534ed77fd.jpg",
              "https://oculair.b-cdn.net/cache/images/dfa646d4fc64ddb3ec60a61e5dbd8e1e1be2f4dc.jpg",
            ].map((src, i) => (
              <motion.div
                className="vu-gallery-item"
                key={i}
                variants={fadeUp}
                custom={i}
                whileHover={{ scale: 1.02 }}
              >
                <Image src={src} alt={`Voices Unheard artwork ${i + 1}`} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─── PROCESS (Sticky Scroll) ─── */}
        <motion.div
          className="vu-process"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
        >
          <motion.h2 className="vu-section-title" variants={fadeUp}>
            The Process
          </motion.h2>
          <div className="vu-process-layout">
            <div className="vu-process-text">
              <motion.p variants={fadeUp} custom={1}>
                This project was a collaborative effort by Nyle Migiizi Johnston,
                Nigel Nolan, and Emmanuel Umukoro — members of Highness Generates,
                a division of Highness Global Inc. The process began with gathering
                datasets from Johnston's and Nolan's artwork, which Umukoro then
                used to create AI-generated imagery.
              </motion.p>
              <motion.p variants={fadeUp} custom={2}>
                The objective was to create a machine-generated collaboration of
                Johnston's and Nolan's work while employing Umukoro's extensive
                knowledge in animation and digital media. This unique approach
                allowed for a blend of traditional artistic styles with cutting-edge
                AI technology.
              </motion.p>
              <motion.p variants={fadeUp} custom={3}>
                The team worked on creating a maximalist vision that incorporates
                patterns, colours, plant life, astronomy, and architecture into a
                new concept of a "church" for marginalized communities. This process
                involved multiple iterations of AI-generated imagery, careful
                curation, and skillful animation to bring the static images to life.
              </motion.p>
            </div>
            <div className="vu-process-media">
              <motion.div variants={fadeUp} custom={1}>
                <Image
                  src="https://oculair.b-cdn.net/cache/images/a464a6d79ac0a23ba1e3dca4ed8f836534ed77fd.jpg"
                  alt="Process artwork 1"
                  fluid
                  style={{ borderRadius: '4px' }}
                />
              </motion.div>
              <motion.div variants={fadeUp} custom={2}>
                <Image
                  src="https://oculair.b-cdn.net/cache/images/dfa646d4fc64ddb3ec60a61e5dbd8e1e1be2f4dc.jpg"
                  alt="Process artwork 2"
                  fluid
                  style={{ borderRadius: '4px' }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ─── IMMERSIVE VIDEO ─── */}
        <motion.div
          className="vu-immersive-video"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <video ref={videoRef2} autoPlay loop muted playsInline>
            <source
              src="https://oculair.b-cdn.net/api/v1/videos/ab378b5c663d95304309a7a814fcae6997042c36/3rjei659/avc"
              type="video/mp4"
            />
          </video>
          <div className="vu-immersive-caption">Immersive Experience</div>
        </motion.div>

        {/* ─── OUTCOME ─── */}
        <motion.div
          className="vu-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
        >
          <motion.h2 className="vu-section-title" variants={fadeUp}>
            The Outcome
          </motion.h2>
          <motion.p variants={fadeUp} custom={1}>
            The final video brings together a maximalist vision of patterns,
            colours, plant life, astronomy, and architecture into a new "church"
            for Indigenous, Queer, and POC folks.{" "}
            <em>
              Voices Unheard: The Church and Marginalized Communities
            </em>{" "}
            layers imagery of the future and thoughts from our past to bring the
            viewer into a space to contemplate new modes of creation, awareness,
            and unity.
          </motion.p>
          <motion.p variants={fadeUp} custom={2}>
            This project showcases the potential of AI in creating immersive,
            thought-provoking art that addresses important social issues. It
            challenges traditional notions of religious spaces and invites viewers
            to consider more inclusive, diverse spiritual environments.
          </motion.p>
        </motion.div>

        {/* ─── PROJECT DETAILS ─── */}
        <motion.div
          className="vu-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.h2 className="vu-section-title" variants={fadeUp}>
            Project Details
          </motion.h2>
          <div className="vu-details-grid">
            {[
              { label: "Date", value: "November 2023" },
              { label: "Exhibition", value: "Inter/Access IA 360° Showcase" },
              { label: "Curators", value: "Kyle Duffield & Terry Anastasiadis" },
              { label: "Collaborators", value: "Nyle Migiizi Johnston, Nigel Nolan, Emmanuel Umukoro" },
              { label: "Technologies", value: "AI-generated imagery, Digital Animation" },
            ].map((item, i) => (
              <motion.div className="vu-detail-card" key={i} variants={fadeUp} custom={i}>
                <div className="vu-meta-label">{item.label}</div>
                <div className="vu-meta-value">{item.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <ReturnToPortfolio />
      </motion.div>
    </HelmetProvider>
  );
};
