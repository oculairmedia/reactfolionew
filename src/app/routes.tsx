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

type LazyComponentLoader = () => Promise<{ default: React.ComponentType }>;

const loadHome: LazyComponentLoader = () => import("../pages/home").then((m) => ({ default: m.Home }));
const loadPortfolio: LazyComponentLoader = () => import("../pages/portfolio").then((m) => ({ default: m.Portfolio }));
const loadAbout: LazyComponentLoader = () => import("../pages/about").then((m) => ({ default: m.About }));
const loadBlog: LazyComponentLoader = () => import("../pages/blog").then((m) => ({ default: m.Blog }));
const loadBlogPost: LazyComponentLoader = () =>
  import("../pages/blog/BlogPost").then((m) => ({ default: m.BlogPost }));
const loadProject: LazyComponentLoader = () => import("../components/DynamicProjectPage");

const Home = React.lazy(loadHome);
const Portfolio = React.lazy(loadPortfolio);
const About = React.lazy(loadAbout);
const Blog = React.lazy(loadBlog);
const BlogPost = React.lazy(loadBlogPost);
const DynamicProjectPage = React.lazy(loadProject);

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

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: () => <Suspended Component={Home} />
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  portfolioRoute,
  blogRoute,
  blogPostRoute,
  projectRoute,
  notFoundRoute
]);

export const router = createRouter({ routeTree });

export { loadHome, loadPortfolio, loadAbout, loadBlog, loadBlogPost, loadProject };
