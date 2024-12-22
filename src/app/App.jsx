import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../features/layout/components/Layout/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner/LoadingSpinner';
import './App.css';

// Lazy load pages
const Home = lazy(() => import('../pages/home'));
const Portfolio = lazy(() => import('../pages/portfolio'));
const About = lazy(() => import('../pages/about'));
const Contact = lazy(() => import('../pages/contact'));
const VoicesUnheard = lazy(() => import('../pages/projects/VoicesUnheard'));
const CoffeeByAltitude = lazy(() => import('../pages/projects/CoffeeByAltitude'));
const GardenCityEssentials = lazy(() => import('../pages/projects/GardenCityEssentials'));
const LieblingWines = lazy(() => import('../pages/projects/LieblingWines'));
const MerchantAleHouse = lazy(() => import('../pages/projects/MerchantAleHouse'));
const SuperBurgersFries = lazy(() => import('../pages/projects/SuperBurgersFries'));
const AquaticResonance = lazy(() => import('../pages/projects/AquaticResonance'));
const Branton = lazy(() => import('../pages/projects/Branton'));
const Binmetrics = lazy(() => import('../pages/projects/Binmetrics'));
const VHBTapes = lazy(() => import('../pages/projects/3MVHBTapes'));
const CoupleIsh = lazy(() => import('../pages/projects/CoupleIsh'));

const App = () => {
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