import React from "react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes";
import { ToastProvider } from "../components/Toast";
import "./App.css";

const App: React.FC = () => {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
};

export default App;
