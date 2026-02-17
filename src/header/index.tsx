import React, { useState } from "react";
import { VscGrabber, VscClose } from "react-icons/vsc";
import { Link } from "@tanstack/react-router";
import { logotext, socialprofils } from "../content_option";
import Themetoggle from "../components/themetoggle";
import { usePrefetch } from "../hooks/usePrefetch";
import { loadHome, loadPortfolio, loadAbout, loadBlog } from "../app/routes";

const Headermain: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const handleToggle = () => {
    setMenuOpen(!menuOpen);
    document.body.classList.toggle("ovhidden");
  };

  const homeHandlers = usePrefetch(loadHome);
  const portfolioHandlers = usePrefetch(loadPortfolio);
  const aboutHandlers = usePrefetch(loadAbout);
  const blogHandlers = usePrefetch(loadBlog);

  return (
    <>
      {/* Main Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-base-100/95 backdrop-blur-sm border-b-2 border-base-content/10">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              className="font-heading text-lg font-bold uppercase tracking-tight text-base-content hover:text-primary transition-colors duration-200"
              to="/"
            >
              {logotext}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                to="/"
                onClick={() =>
                  document
                    .getElementById("page-top")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                {...homeHandlers}
                className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.15em] text-base-content/70 hover:text-base-content transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                to="/portfolio"
                onClick={() =>
                  document
                    .getElementById("page-top")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                {...portfolioHandlers}
                className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.15em] text-base-content/70 hover:text-base-content transition-colors duration-200"
              >
                Portfolio
              </Link>
              <Link
                to="/about"
                onClick={() =>
                  document
                    .getElementById("page-top")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                {...aboutHandlers}
                className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.15em] text-base-content/70 hover:text-base-content transition-colors duration-200"
              >
                About
              </Link>
              <a
                href="#contact-footer"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  document
                    .getElementById("contact-footer")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.15em] text-base-content/70 hover:text-base-content transition-colors duration-200 cursor-pointer"
              >
                Contact
              </a>
              <Link
                to="/blog"
                onClick={() =>
                  document
                    .getElementById("page-top")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                {...blogHandlers}
                className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.15em] text-base-content/70 hover:text-base-content transition-colors duration-200"
              >
                Blog
              </Link>
            </nav>

            {/* Right Side - Theme Toggle & Mobile Menu */}
            <div className="flex items-center gap-4">
              <Themetoggle />
              <button
                className="lg:hidden btn btn-ghost btn-square text-xl"
                onClick={handleToggle}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? <VscClose /> : <VscGrabber />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-base-100" />

        {/* Menu Content */}
        <div className="relative h-full flex flex-col justify-center items-center">
          <nav className="flex flex-col items-center gap-8">
            <Link
              onClick={() => {
                handleToggle();
                document
                  .getElementById("page-top")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              to="/"
              className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-tight text-base-content hover:text-primary transition-colors duration-200"
              {...homeHandlers}
            >
              Home
            </Link>
            <Link
              onClick={() => {
                handleToggle();
                document
                  .getElementById("page-top")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              to="/portfolio"
              className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-tight text-base-content hover:text-primary transition-colors duration-200"
              {...portfolioHandlers}
            >
              Portfolio
            </Link>
            <Link
              onClick={() => {
                handleToggle();
                document
                  .getElementById("page-top")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              to="/about"
              className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-tight text-base-content hover:text-primary transition-colors duration-200"
              {...aboutHandlers}
            >
              About
            </Link>
            <a
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                handleToggle();
                setTimeout(
                  () =>
                    document
                      .getElementById("contact-footer")
                      ?.scrollIntoView({ behavior: "smooth" }),
                  300,
                );
              }}
              href="#contact-footer"
              className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-tight text-base-content hover:text-primary transition-colors duration-200 cursor-pointer"
            >
              Contact
            </a>
            <Link
              onClick={() => {
                handleToggle();
                document
                  .getElementById("page-top")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              to="/blog"
              className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-tight text-base-content hover:text-primary transition-colors duration-200"
              {...blogHandlers}
            >
              Blog
            </Link>
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t-2 border-base-content/10">
          <div className="flex items-center gap-6">
            {socialprofils.facebook && (
              <a
                href={socialprofils.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-base-content/60 hover:text-base-content transition-colors duration-200"
              >
                Facebook
              </a>
            )}
            {socialprofils.github && (
              <a
                href={socialprofils.github}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-base-content/60 hover:text-base-content transition-colors duration-200"
              >
                Github
              </a>
            )}
            {socialprofils.twitter && (
              <a
                href={socialprofils.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-base-content/60 hover:text-base-content transition-colors duration-200"
              >
                Twitter
              </a>
            )}
          </div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-base-content/40">
            © {new Date().getFullYear()} {logotext}
          </p>
        </div>
      </div>

      {/* Brutalist Border Frames */}
      <div className="fixed top-0 left-0 right-0 h-[10px] bg-base-100 z-[60] pointer-events-none" />
      <div className="fixed bottom-0 left-0 right-0 h-[10px] bg-base-100 z-[60] pointer-events-none" />
      <div className="fixed top-0 bottom-0 left-0 w-[10px] bg-base-100 z-[60] pointer-events-none" />
      <div className="fixed top-0 bottom-0 right-0 w-[10px] bg-base-100 z-[60] pointer-events-none" />
    </>
  );
};

export default Headermain;
