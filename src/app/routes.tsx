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
import {
  loadHome,
  loadPortfolio,
  loadAbout,
  loadBlog,
  loadBlogPost,
  loadProject,
  loadLinks,
  loadPrivacy,
  loadTerms,
} from "./route-loaders";

const Home = React.lazy(loadHome);
const Portfolio = React.lazy(loadPortfolio);
const About = React.lazy(loadAbout);
const Blog = React.lazy(loadBlog);
const BlogPost = React.lazy(loadBlogPost);
const DynamicProjectPage = React.lazy(loadProject);
const Links = React.lazy(loadLinks);
const Privacy = React.lazy(loadPrivacy);
const Terms = React.lazy(loadTerms);

interface SuspendedProps {
  Component: React.LazyExoticComponent<React.ComponentType>;
}

const Suspended: React.FC<SuspendedProps> = ({ Component }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
);

const rootRoute = createRootRoute({
  component: () => (
    <div className="s_c bg-base-100 text-base-content min-h-screen">
      <div id="page-top" className="app-wrapper">
        <Headermain />
        <Outlet />
      </div>
      <ContactFooter />
      <Socialicons />
    </div>
  ),
});

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

const linksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/links",
  component: () => <Suspended Component={Links} />,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: () => <Suspended Component={Privacy} />,
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: () => <Suspended Component={Terms} />,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: () => <Suspended Component={Home} />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  portfolioRoute,
  blogRoute,
  blogPostRoute,
  projectRoute,
  linksRoute,
  privacyRoute,
  termsRoute,
  notFoundRoute,
]);

export const router = createRouter({ routeTree });

export {
  loadHome,
  loadPortfolio,
  loadAbout,
  loadBlog,
  loadBlogPost,
  loadProject,
  loadLinks,
  loadPrivacy,
  loadTerms,
} from "./route-loaders";
