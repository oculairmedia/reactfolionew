import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from '../Navigation/Navigation';
import { Socialicons } from '../../../../components/socialicons';
import { ContactFooter } from '../../../../components/ContactFooter';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import './Layout.css';

export const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navigation />
      <main className="main-content">
        <Suspense fallback={<LoadingSpinner />}>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
      <ContactFooter />
      <Socialicons />
    </div>
  );
};