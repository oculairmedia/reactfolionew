import React from "react";
import { renderToString } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import {
  createMemoryHistory,
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router";
import {
  attachRouterServerSsrUtils,
  RouterServer,
} from "@tanstack/react-router/ssr/server";
import { ToastProvider } from "./components/Toast";
import Headermain from "./header";
import { ContactFooter } from "./components/ContactFooter";
import { Socialicons } from "./components/socialicons";
import { Home } from "./pages/home";
import { Portfolio } from "./pages/portfolio";
import { About } from "./pages/about";
import { Blog } from "./pages/blog";
import { BlogPost } from "./pages/blog/BlogPost";
import { Links } from "./pages/links";
import { Privacy } from "./pages/privacy";
import { Terms } from "./pages/terms";
import DynamicProjectPage from "./components/DynamicProjectPage";
import "./index.css";

// SSR-only route tree.
//
// The client (`src/app/routes.tsx`) wraps every page in `React.lazy` for
// code-splitting. `React.lazy` is a CSR primitive — it cannot run during
// SSR. So the SSR tree imports pages directly and mirrors the client's
// path/component map one-for-one. Keep both trees in sync when adding
// routes.

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
  component: () => <Home />,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: () => <About />,
});

const portfolioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/portfolio",
  component: () => <Portfolio />,
});

const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog",
  component: () => <Blog />,
});

const blogPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog/$slug",
  component: () => <BlogPost />,
});

const projectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$slug",
  component: () => <DynamicProjectPage />,
});

const linksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/links",
  component: () => <Links />,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: () => <Privacy />,
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: () => <Terms />,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: () => <Home />,
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

export async function render(
  url: string,
): Promise<{ html: string; head: string }> {
  // Per the TanStack Router SSR pattern, the history must be applied via
  // `router.update()` AFTER construction (not in the constructor), and
  // `attachRouterServerSsrUtils` must be called before `router.load()` so
  // the server-side render path can dehydrate state for hydration.
  const router = createRouter({ routeTree });

  attachRouterServerSsrUtils({ router, manifest: undefined });

  router.update({
    history: createMemoryHistory({ initialEntries: [url] }),
    origin: "http://localhost",
  });

  await router.load();
  await router.serverSsr?.dehydrate();

  const html = renderToString(
    <React.StrictMode>
      <HelmetProvider>
        <ToastProvider>
          <RouterServer router={router} />
        </ToastProvider>
      </HelmetProvider>
    </React.StrictMode>,
  );

  return { html, head: "" };
}
