import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes";
import "./App.css";

// ScrollToTop implementation is redundant if TanStack Router handles scroll (it does by default),
// but for "page-top" ID scrolling we might need a custom hook later. 
// For now, let's trust TanStack's default scroll restoration or add it back if needed via router options.

export default function App() {
  return (
    <RouterProvider router={router} />
  );
}
