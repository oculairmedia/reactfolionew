import React from "react";
import { renderToString } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import {
  createMemoryHistory,
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { ToastProvider } from "./components/Toast";
import Headermain from "./header";
import { ContactFooter } from "./components/ContactFooter";
import { Socialicons } from "./components/socialicons";
import { Home } from "./pages/home";
import "./index.css";

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

const routeTree = rootRoute.addChildren([indexRoute]);

export async function render(
  url: string,
): Promise<{ html: string; head: string }> {
  const memoryHistory = createMemoryHistory({ initialEntries: [url] });
  const router = createRouter({ routeTree, history: memoryHistory });

  await router.load();

  const html = renderToString(
    <React.StrictMode>
      <HelmetProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </HelmetProvider>
    </React.StrictMode>,
  );

  return { html, head: "" };
}
