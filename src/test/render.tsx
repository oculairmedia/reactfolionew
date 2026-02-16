import React from 'react';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';

export function renderWithProviders(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <HelmetProvider>{children}</HelmetProvider>
    ),
  });
}
