import React from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import withRouter from "../hooks/withRouter"
import { Home } from "../pages/home";
import { Portfolio } from "../pages/portfolio";
import { ContactUs } from "../pages/contact";
import { About } from "../pages/about";
import { Blog } from "../pages/blog";
import { BlogPost } from "../pages/blog/BlogPost";
import DynamicProjectPage from "../components/DynamicProjectPage";
import { Socialicons } from "../components/socialicons";
import { ContactFooter } from "../components/ContactFooter";

const AnimatedRoutes = withRouter(({ location }) => (
  <Routes location={location}>
    <Route exact path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/portfolio" element={<Portfolio />} />
    <Route path="/contact" element={<ContactUs />} />
    <Route path="/projects/:slug" element={<DynamicProjectPage />} />
    <Route path="/blog" element={<Blog />} />
    <Route path="/blog/:slug" element={<BlogPost />} />
    <Route path="*" element={<Home />} />
  </Routes>
));

function AppRoutes() {
  const location = useLocation();
  const isContactPage = location.pathname === "/contact";

  return (
    <div className="s_c">
      <AnimatedRoutes />
      {!isContactPage && <ContactFooter />}
      <Socialicons />
    </div>
  );
}

export default AppRoutes;
