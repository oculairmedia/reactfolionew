import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./app/App";
import { router } from "./app/routes";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

const app = (
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

const html = document.documentElement;
const normalizePath = (p: string) => p.replace(/\/+$/, "") || "/";

// scripts/prerender.mjs stamps each page with the route it was rendered for.
// vercel.json rewrites every other URL (e.g. /projects/:slug) to the home
// page's HTML, so markup can arrive for a different route than the one in
// the address bar. Only hydrate when the markup belongs to this URL.
const prerenderedFor = html.getAttribute("data-prerendered");
const markupMatchesUrl =
  rootElement.hasChildNodes() &&
  prerenderedFor !== null &&
  normalizePath(prerenderedFor) === normalizePath(window.location.pathname);

if (markupMatchesUrl) {
  // Two things must be true for the first client render to match the
  // prerendered HTML; otherwise React discards the whole tree and
  // re-renders it (errors #418/#423):
  //
  // 1. The router has matched the URL and loaded the page's code. The
  //    server renders after `router.load()` resolves (entry-server.tsx);
  //    hydrating earlier renders an empty <Outlet>.
  // 2. `router.ssr` is set. Without it, TanStack Router wraps the client
  //    tree in a <Suspense> boundary the server never rendered. This is
  //    normally set by TanStack's own `hydrate()`, but our prerender does
  //    not emit the `$_TSR` bootstrap data it needs, so we set it directly.
  //    It also stops the router's mount-time load from re-running.
  router.ssr = { manifest: undefined };
  router.load().finally(() => {
    ReactDOM.hydrateRoot(rootElement, app);
    html.removeAttribute("data-prerendered");
  });
} else {
  // No markup, or markup for another route: render from scratch.
  // createRoot replaces the existing children of rootElement.
  html.removeAttribute("data-prerendered");
  ReactDOM.createRoot(rootElement).render(app);
}

if (import.meta.env.DEV) {
  import("vibe-kanban-web-companion").then(({ VibeKanbanWebCompanion }) => {
    const devRoot = document.createElement("div");
    devRoot.id = "vibe-kanban-root";
    document.body.appendChild(devRoot);
    ReactDOM.createRoot(devRoot).render(<VibeKanbanWebCompanion />);
  });
}
