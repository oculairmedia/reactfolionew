import React from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import withRouter from "../hooks/withRouter"
const loadHome = () => import("../pages/home").then(m => ({ default: m.Home }));
const loadPortfolio = () => import("../pages/portfolio").then(m => ({ default: m.Portfolio }));
const loadAbout = () => import("../pages/about").then(m => ({ default: m.About }));
const loadBlog = () => import("../pages/blog").then(m => ({ default: m.Blog }));
const loadBlogPost = () => import("../pages/blog/BlogPost").then(m => ({ default: m.BlogPost }));
const loadProject = () => import("../components/DynamicProjectPage");
import { Socialicons } from "../components/socialicons";
import { ContactFooter } from "../components/ContactFooter";

import { Home } from "../pages/home";

// Export loaders for prefetching (loadHome still needed for hover prefetching)
export { loadHome, loadPortfolio, loadAbout, loadBlog, loadBlogPost, loadProject };

// const Home = React.lazy(loadHome); // Removed to fix FOUC
const Portfolio = React.lazy(loadPortfolio);
const About = React.lazy(loadAbout);
const Blog = React.lazy(loadBlog);
const BlogPost = React.lazy(loadBlogPost);
const DynamicProjectPage = React.lazy(loadProject);

const AnimatedRoutes = withRouter(({ location }) => (
  <Routes location={location}>
    <Route exact path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/portfolio" element={<Portfolio />} />
    <Route path="/projects/:slug" element={<DynamicProjectPage />} />
    <Route path="/blog" element={<Blog />} />
    <Route path="/blog/:slug" element={<BlogPost />} />
    <Route path="*" element={<Home />} />
  </Routes>
));

import { Suspense } from "react";
import { LoadingSpinner } from "../components/LoadingSpinner";

function AppRoutes() {
  const location = useLocation();

  return (
    <div className="s_c">
      <Suspense fallback={<LoadingSpinner />}>
        <AnimatedRoutes />
      </Suspense>
      <ContactFooter />
      <Socialicons />
    </div>
  );
}

export default AppRoutes;
