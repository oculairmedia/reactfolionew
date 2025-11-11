import React, { lazy, Suspense, useEffect } from 'react';
import { usePerformance } from '../hooks/usePerformance';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../features/layout/components/Layout/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner/LoadingSpinner';
import './App.css';

// Lazy load pages with webpack chunk names for better debugging
const Home = lazy(() => import(/* webpackChunkName: "home" */ '../pages/home'));
const Portfolio = lazy(() => import(/* webpackChunkName: "portfolio" */ '../pages/portfolio'));
const About = lazy(() => import(/* webpackChunkName: "about" */ '../pages/about'));
const Contact = lazy(() => import(/* webpackChunkName: "contact" */ '../pages/contact'));
const VoicesUnheard = lazy(() => import(/* webpackChunkName: "project-voices" */ '../pages/projects/VoicesUnheard'));
const CoffeeByAltitude = lazy(() => import(/* webpackChunkName: "project-coffee" */ '../pages/projects/CoffeeByAltitude'));
const GardenCityEssentials = lazy(() => import(/* webpackChunkName: "project-garden" */ '../pages/projects/GardenCityEssentials'));
const LieblingWines = lazy(() => import(/* webpackChunkName: "project-liebling" */ '../pages/projects/LieblingWines'));
const MerchantAleHouse = lazy(() => import(/* webpackChunkName: "project-merchant" */ '../pages/projects/MerchantAleHouse'));
const SuperBurgersFries = lazy(() => import(/* webpackChunkName: "project-burgers" */ '../pages/projects/SuperBurgersFries'));
const AquaticResonance = lazy(() => import(/* webpackChunkName: "project-aquatic" */ '../pages/projects/AquaticResonance'));
const Branton = lazy(() => import(/* webpackChunkName: "project-branton" */ '../pages/projects/Branton'));
const Binmetrics = lazy(() => import(/* webpackChunkName: "project-binmetrics" */ '../pages/projects/Binmetrics'));
const VHBTapes = lazy(() => import(/* webpackChunkName: "project-vhb" */ '../pages/projects/3MVHBTapes'));
const CoupleIsh = lazy(() => import(/* webpackChunkName: "project-couple" */ '../pages/projects/CoupleIsh'));

const App = () => {
  usePerformance();

  useEffect(() => {
    // Unregister any existing service workers to prevent API caching issues
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
          console.log('ServiceWorker unregistered');
        });
      });
    }
  }, []);
  return (
    <Router>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/projects/3m-vhb-tapes" element={<VHBTapes />} />
            <Route path="/projects/binmetrics" element={<Binmetrics />} />
            <Route path="/projects/voices-unheard" element={<VoicesUnheard />} />
            <Route path="/projects/coffee-by-altitude" element={<CoffeeByAltitude />} />
            <Route path="/projects/garden-city-essentials" element={<GardenCityEssentials />} />
            <Route path="/projects/liebling-wines" element={<LieblingWines />} />
            <Route path="/projects/merchant-ale-house" element={<MerchantAleHouse />} />
            <Route path="/projects/super-burgers-fries" element={<SuperBurgersFries />} />
            <Route path="/projects/aquatic-resonance" element={<AquaticResonance />} />
            <Route path="/projects/branton" element={<Branton />} />
            <Route path="/projects/couple-ish" element={<CoupleIsh />} />
            <Route path="/blog" element={<Navigate to="https://blog.emmanuelu.com/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
};

export default App;