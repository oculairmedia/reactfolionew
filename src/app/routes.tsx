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

type Loader = () => Promise<{ default: React.ComponentType }>;
type PreloadableComponent = React.FC & { preload: () => Promise<void> };

/**
 * A code-split page that TanStack Router can wait for.
 *
 * `router.load()` awaits `.preload()` on route components, and hydration
 * (entry-client.tsx) waits on `router.load()`. Once the chunk has loaded,
 * the page renders the real component directly, with no Suspense wrapper,
 * which is exactly what the server renders (entry-server.tsx imports pages
 * directly). That keeps the first client render identical to the
 * prerendered HTML.
 *
 * React.lazy is kept only as a fallback for the rare render that happens
 * before the chunk arrives. It cannot be used on the hydration path: it
 * suspends on first render even when its promise has already resolved,
 * and its extra Suspense boundary is not present in the server markup.
 */
function lazyPage(loader: Loader): PreloadableComponent {
  let promise: Promise<{ default: React.ComponentType }> | undefined;
  let Resolved: React.ComponentType | undefined;
  const load = () =>
    (promise ??= loader().then((m) => {
      Resolved = m.default;
      return m;
    }));
  const Lazy = React.lazy(load);
  const Page: React.FC = () =>
    Resolved ? (
      <Resolved />
    ) : (
      <Suspense fallback={<LoadingSpinner />}>
        <Lazy />
      </Suspense>
    );
  return Object.assign(Page, {
    preload: () => load().then(() => undefined),
  });
}

const Home = lazyPage(loadHome);
const Portfolio = lazyPage(loadPortfolio);
const About = lazyPage(loadAbout);
const Blog = lazyPage(loadBlog);
const BlogPost = lazyPage(loadBlogPost);
const DynamicProjectPage = lazyPage(loadProject);
const Links = lazyPage(loadLinks);
const Privacy = lazyPage(loadPrivacy);
const Terms = lazyPage(loadTerms);

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
  component: Home,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: About,
});

const portfolioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/portfolio",
  component: Portfolio,
});

const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog",
  component: Blog,
});

const blogPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog/$slug",
  component: BlogPost,
});

const projectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$slug",
  component: DynamicProjectPage,
});

const linksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/links",
  component: Links,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: Privacy,
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: Terms,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: Home,
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
