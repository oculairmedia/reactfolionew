import React, { useState } from "react";
import "./style.css";
import { VscGrabber, VscClose } from "react-icons/vsc";
import { Link } from "react-router-dom";
import { logotext, socialprofils } from "../content_option";
import Themetoggle from "../components/themetoggle";
import { usePrefetch } from "../hooks/usePrefetch";
import { loadHome, loadPortfolio, loadAbout, loadBlog } from "../app/routes";

const Headermain = () => {
  const [isActive, setActive] = useState("false");

  const handleToggle = () => {
    setActive(!isActive);
    document.body.classList.toggle("ovhidden");
  };

  // Prefetch handlers using code splitting loaders
  const homeHandlers = usePrefetch(loadHome);
  const portfolioHandlers = usePrefetch(loadPortfolio);
  const aboutHandlers = usePrefetch(loadAbout);
  const blogHandlers = usePrefetch(loadBlog);

  return (
    <>
      {/* ===== HEADER BAR (has backdrop-filter) ===== */}
      <header className="fixed-top site__header">
        <div className="d-flex align-items-center justify-content-between">
          <Link className="navbar-brand nav_ac" to="/">
            {logotext}
          </Link>
          <nav className="desktop-nav">
            <Link to="/" onClick={() => document.getElementById('page-top')?.scrollIntoView({ behavior: 'smooth' })} {...homeHandlers}>Home</Link>
            <Link to="/portfolio" onClick={() => document.getElementById('page-top')?.scrollIntoView({ behavior: 'smooth' })} {...portfolioHandlers}>Portfolio</Link>
            <Link to="/about" onClick={() => document.getElementById('page-top')?.scrollIntoView({ behavior: 'smooth' })} {...aboutHandlers}>About</Link>
            <a href="#contact-footer" onClick={(e) => { e.preventDefault(); document.getElementById('contact-footer')?.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a>
            <Link to="/blog" onClick={() => document.getElementById('page-top')?.scrollIntoView({ behavior: 'smooth' })} {...blogHandlers}>Blog</Link>
          </nav>
          <div className="d-flex align-items-center">
            <Themetoggle />
            {/* Hamburger — hidden on desktop via CSS */}
            <button className="menu__button nav_ac mobile-menu-btn" onClick={handleToggle}>
              {!isActive ? <VscClose /> : <VscGrabber />}
            </button>
          </div>
        </div>
      </header>

      {/*
        ===== MOBILE FULLSCREEN OVERLAY =====
        IMPORTANT: This MUST be OUTSIDE <header> because the header
        uses backdrop-filter, which creates a containing block that
        traps position:fixed children (CSS spec behavior).
      */}
      <div className={`site__navigation ${!isActive ? "menu__opend" : ""}`}>
        <div className="bg__menu h-100">
          <div className="menu__wrapper">
            <div className="menu__container p-3">
              <ul className="the_menu">
                <li className="menu_item ">
                  <Link onClick={() => { handleToggle(); document.getElementById('page-top')?.scrollIntoView({ behavior: 'smooth' }); }} to="/" className="my-3" {...homeHandlers}>Home</Link>
                </li>
                <li className="menu_item">
                  <Link onClick={() => { handleToggle(); document.getElementById('page-top')?.scrollIntoView({ behavior: 'smooth' }); }} to="/portfolio" className="my-3" {...portfolioHandlers}> Portfolio</Link>
                </li>
                <li className="menu_item">
                  <Link onClick={() => { handleToggle(); document.getElementById('page-top')?.scrollIntoView({ behavior: 'smooth' }); }} to="/about" className="my-3" {...aboutHandlers}>About</Link>
                </li>
                <li className="menu_item">
                  <a onClick={(e) => { e.preventDefault(); handleToggle(); setTimeout(() => document.getElementById('contact-footer')?.scrollIntoView({ behavior: 'smooth' }), 300); }} href="#contact-footer" className="my-3"> Contact</a>
                </li>
                <li className="menu_item">
                  <Link onClick={() => { handleToggle(); document.getElementById('page-top')?.scrollIntoView({ behavior: 'smooth' }); }} to="/blog" className="my-3" {...blogHandlers}>Blog</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="menu_footer d-flex flex-column flex-md-row justify-content-between align-items-md-center position-absolute w-100 p-3">
          <div className="d-flex">
            <a href={socialprofils.facebook}>Facebook</a>
            <a href={socialprofils.github}>Github</a>
            <a href={socialprofils.twitter}>Twitter</a>
          </div>
          <p className="copyright m-0">copyright __ {logotext}</p>
        </div>
      </div>

      {/* Page border frame */}
      <div className="br-top"></div>
      <div className="br-bottom"></div>
      <div className="br-left"></div>
      <div className="br-right"></div>
    </>
  );
};

export default Headermain;
