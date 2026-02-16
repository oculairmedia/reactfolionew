import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes";
import "./App.css";

const App: React.FC = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App;
