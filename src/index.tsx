import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from "./app/App";
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

if (import.meta.env.DEV) {
  import('vibe-kanban-web-companion').then(({ VibeKanbanWebCompanion }) => {
    const devRoot = document.createElement('div');
    devRoot.id = 'vibe-kanban-root';
    document.body.appendChild(devRoot);
    ReactDOM.createRoot(devRoot).render(<VibeKanbanWebCompanion />);
  });
}
