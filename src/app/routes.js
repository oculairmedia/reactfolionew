import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import withRouter from "../hooks/withRouter"
import { Home } from "../pages/home";
import { Portfolio } from "../pages/portfolio";
import { ContactUs } from "../pages/contact";
import { About } from "../pages/about";
import DynamicProjectPage from "../components/DynamicProjectPage";
import { Socialicons } from "../components/socialicons";

const AnimatedRoutes = withRouter(({ location }) => (
  <Routes location={location}>
    <Route exact path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/portfolio" element={<Portfolio />} />
    <Route path="/contact" element={<ContactUs />} />
    <Route path="/projects/:slug" element={<DynamicProjectPage />} />
    <Route path="/blog" element={<Navigate to="https://blogs.emmanuelu.com/" replace />} />
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
