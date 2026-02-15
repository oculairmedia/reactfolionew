import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter as Router,
  useLocation,
} from "react-router-dom";
import AppRoutes from "./routes";
import Headermain from "../header";
import "./App.css";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.getElementById('page-top')?.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('page-top').scrollIntoView();
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <div id="page-top" className="app-wrapper">
        <Headermain />
        <AppRoutes />
      </div>
    </Router>
  );
}
