import React from "react";
import { Link } from "@tanstack/react-router";
import { logotext, socialprofils } from "../content_option";
import Themetoggle from "../components/themetoggle";
import { usePrefetch } from "../hooks/usePrefetch";
import { loadHome, loadPortfolio, loadAbout, loadBlog } from "../app/routes";

const Headermain: React.FC = () => {
  const homeHandlers = usePrefetch(loadHome);
  const portfolioHandlers = usePrefetch(loadPortfolio);
  const aboutHandlers = usePrefetch(loadAbout);
  const blogHandlers = usePrefetch(loadBlog);
  const closeDrawer = () => {
    const checkbox = document.getElementById(
      "mobile-drawer",
    ) as HTMLInputElement;
    if (checkbox) checkbox.checked = false;
  };

  const scrollToTop = () => {
    document.getElementById("page-top")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    closeDrawer();
    setTimeout(
      () =>
        document
          .getElementById("contact-footer")
          ?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => {
    const linkClass = mobile
      ? "font-heading text-2xl md:text-3xl font-bold uppercase tracking-tight text-base-content hover:text-primary transition-colors duration-200"
      : "font-mono text-[0.7rem] font-medium uppercase tracking-[0.15em] text-base-content/70 hover:text-base-content transition-colors duration-200";

    return (
      <>
        <Link
          to="/"
          onClick={() => {
            if (mobile) closeDrawer();
            scrollToTop();
          }}
          {...homeHandlers}
          className={linkClass}
        >
          Home
        </Link>
        <Link
          to="/portfolio"
          onClick={() => {
            if (mobile) closeDrawer();
            scrollToTop();
          }}
          {...portfolioHandlers}
          className={linkClass}
        >
          Portfolio
        </Link>
        <Link
          to="/about"
          onClick={() => {
            if (mobile) closeDrawer();
            scrollToTop();
          }}
          {...aboutHandlers}
          className={linkClass}
        >
          About
        </Link>
        <a
          href="#contact-footer"
          onClick={scrollToContact}
          className={`${linkClass} cursor-pointer`}
        >
          Contact
        </a>
        <Link
          to="/blog"
          onClick={() => {
            if (mobile) closeDrawer();
            scrollToTop();
          }}
          {...blogHandlers}
          className={linkClass}
        >
          Blog
        </Link>
      </>
    );
  };

  return (
    <div className="drawer drawer-end">
      <input id="mobile-drawer" type="checkbox" className="drawer-toggle" />

      {/* Page Content */}
      <div className="drawer-content">
        {/* Navbar */}
        <header className="navbar fixed top-0 left-0 right-0 z-50 bg-base-100/95 backdrop-blur-sm border-b-2 border-base-content/10 px-4 md:px-6 lg:px-10">
          {/* Navbar Start - Logo */}
          <div className="navbar-start">
            <Link
              className="font-heading text-lg font-bold uppercase tracking-tight text-base-content hover:text-primary transition-colors duration-200"
              to="/"
            >
              {logotext}
            </Link>
          </div>

          {/* Navbar Center - Desktop Navigation */}
          <div className="navbar-center hidden lg:flex">
            <nav className="menu menu-horizontal gap-6">
              <NavLinks />
            </nav>
          </div>

          {/* Navbar End - Theme Toggle & Menu Button */}
          <div className="navbar-end gap-2">
            <Themetoggle />

            {/* Mobile Menu Button */}
            <label
              htmlFor="mobile-drawer"
              className="btn btn-ghost btn-square lg:hidden drawer-button"
              aria-label="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
          </div>
        </header>

        {/* Brutalist Border Frames */}
        <div className="fixed top-0 left-0 right-0 h-[10px] bg-base-100 z-[60] pointer-events-none" />
        <div className="fixed bottom-0 left-0 right-0 h-[10px] bg-base-100 z-[60] pointer-events-none" />
        <div className="fixed top-0 bottom-0 left-0 w-[10px] bg-base-100 z-[60] pointer-events-none" />
        <div className="fixed top-0 bottom-0 right-0 w-[10px] bg-base-100 z-[60] pointer-events-none" />
      </div>

      {/* Mobile Drawer Sidebar */}
      <div className="drawer-side z-[70]">
        <label
          htmlFor="mobile-drawer"
          aria-label="Close menu"
          className="drawer-overlay"
        />

        <div className="menu bg-base-100 min-h-full w-full sm:w-80 p-6 flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between mb-10 border-b-2 border-base-content/10 pb-6">
            <Link
              to="/"
              onClick={closeDrawer}
              className="font-heading text-xl font-bold uppercase tracking-tight text-base-content"
            >
              {logotext}
            </Link>
            <label
              htmlFor="mobile-drawer"
              className="btn btn-ghost btn-square"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </label>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col items-start gap-6 flex-grow">
            <NavLinks mobile />
          </nav>

          {/* Drawer Footer */}
          <div className="mt-auto pt-6 border-t-2 border-base-content/10">
            {/* Social Links */}
            <div className="flex items-center gap-4 mb-4">
              {socialprofils.linkedin && (
                <a
                  href={socialprofils.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm btn-square"
                  aria-label="LinkedIn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              )}
              {socialprofils.github && (
                <a
                  href={socialprofils.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm btn-square"
                  aria-label="GitHub"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              )}
              {socialprofils.twitter && (
                <a
                  href={socialprofils.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm btn-square"
                  aria-label="Twitter"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
            </div>

            {/* Copyright */}
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-base-content/40">
              © {new Date().getFullYear()} {logotext}
            </p>

            {/* Status */}
            <div className="flex items-center gap-2 mt-3">
              <span className="status status-success"></span>
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-base-content/50">
                Available for work
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Headermain;
