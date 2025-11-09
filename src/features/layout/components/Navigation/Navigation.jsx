import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';
import { navigation, logotext } from '../../../../content_option';
import './Navigation.css';

// Sort menu items by order and map to component format
const menuItems = navigation.menuItems
  .sort((a, b) => a.order - b.order)
  .map(item => ({
    path: item.path,
    label: item.label,
    external: item.external || false
  }));

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      x: '100%',
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const menuItemVariants = {
    closed: { x: 20, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  return (
    <motion.nav 
      className={`navigation ${scrolled ? 'scrolled' : ''}`}
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          <motion.span
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {logotext}
          </motion.span>
        </Link>

        <div className="nav-controls">
          <ThemeToggle />
          <button 
            className={`menu-toggle ${isOpen ? 'open' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="mobile-menu"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {menuItems.map((item) => (
                <motion.div
                  key={item.path}
                  variants={menuItemVariants}
                >
                  {item.external ? (
                    <a 
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={location.pathname === item.path ? 'active' : ''}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className={location.pathname === item.path ? 'active' : ''}
                    >
                      {item.label}
                    </Link>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="desktop-menu">
          {menuItems.map((item) => (
            <motion.div
              key={item.path}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              {item.external ? (
                <a 
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.label}
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};