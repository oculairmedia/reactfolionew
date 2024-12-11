import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import withRouter from "../hooks/withRouter"
import { Home } from "../pages/home";
import { Portfolio } from "../pages/portfolio";
import { ContactUs } from "../pages/contact";
import { About } from "../pages/about";
import { VoicesUnheard } from "../pages/projects/VoicesUnheard";
import { CoffeeByAltitude } from "../pages/projects/CoffeeByAltitude";
import { GardenCityEssentials } from "../pages/projects/GardenCityEssentials";
import { LieblingWines } from "../pages/projects/LieblingWines";
import { MerchantAleHouse } from "../pages/projects/MerchantAleHouse";
import { SuperBurgersFries } from "../pages/projects/SuperBurgersFries";
import AquaticResonance from "../pages/projects/AquaticResonance";
import { Branton } from "../pages/projects/Branton";
import Binmetrics from "../pages/projects/Binmetrics";
import VHBTapes from "../pages/projects/3MVHBTapes";
import CoupleIsh from "../pages/projects/CoupleIsh";
import { Socialicons } from "../components/socialicons";

const AnimatedRoutes = withRouter(({ location }) => (
  <Routes location={location}>
    <Route exact path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/portfolio" element={<Portfolio />} />
    <Route path="/contact" element={<ContactUs />} />
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
    <Route path="*" element={<Home />} />
  </Routes>
));

function AppRoutes() {
  return (
    <div className="s_c">
      <AnimatedRoutes />
      <Socialicons />
    </div>
  );
}

export default AppRoutes;
