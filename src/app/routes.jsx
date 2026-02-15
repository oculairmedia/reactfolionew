import React, { Suspense } from "react";
import {
  Outlet,
  createRouter,
  createRoute,
  createRootRoute,
} from "@tanstack/react-router";
import { LoadingSpinner } from "../components/LoadingSpinner";
import Headermain from "../header";
import { ContactFooter } from "../components/ContactFooter";
import { Socialicons } from "../components/socialicons";

// Lazy Load Pages
const loadHome = () => import("../pages/home").then((m) => ({ default: m.Home }));
const loadPortfolio = () => import("../pages/portfolio").then((m) => ({ default: m.Portfolio }));
const loadAbout = () => import("../pages/about").then((m) => ({ default: m.About }));
const loadBlog = () => import("../pages/blog").then((m) => ({ default: m.Blog }));
const loadBlogPost = () =>
  import("../pages/blog/BlogPost").then((m) => ({ default: m.BlogPost }));
const loadProject = () => import("../components/DynamicProjectPage");

const Home = React.lazy(loadHome);
const Portfolio = React.lazy(loadPortfolio);
const About = React.lazy(loadAbout);
const Blog = React.lazy(loadBlog);
const BlogPost = React.lazy(loadBlogPost);
const DynamicProjectPage = React.lazy(loadProject);

// Helper for Suspense wrapper
const Suspended = ({ Component }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
);

// Root Layout
const rootRoute = createRootRoute({
  component: () => (
    <div className="s_c">
      <div id="page-top" className="app-wrapper">
        <Headermain />
        <Outlet />
      </div>
      <ContactFooter />
      <Socialicons />
    </div>
  ),
});

// Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Suspended Component={Home} />,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: () => <Suspended Component={About} />,
});

const portfolioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/portfolio",
  component: () => <Suspended Component={Portfolio} />,
});

const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog",
  component: () => <Suspended Component={Blog} />,
});

const blogPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog/$slug",
  component: () => <Suspended Component={BlogPost} />,
});

const projectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$slug",
  component: () => <Suspended Component={DynamicProjectPage} />,
});

// Catch-all (Simple 404 for now, redirects to Home as per legacy)
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: () => <Suspended Component={Home} />
})

// Route Tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  portfolioRoute,
  blogRoute,
  blogPostRoute,
  projectRoute,
  notFoundRoute
]);

// Router
export const router = createRouter({ routeTree });

// Pre-fetch exports (legacy support if needed)
export { loadHome, loadPortfolio, loadAbout, loadBlog, loadBlogPost, loadProject };
