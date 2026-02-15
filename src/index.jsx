import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { VibeKanbanWebCompanion } from 'vibe-kanban-web-companion';
import App from "./app/App.jsx";
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <VibeKanbanWebCompanion />
    <ErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
