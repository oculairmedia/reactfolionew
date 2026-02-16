import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';

const mockSend = vi.fn();
vi.mock('emailjs-com', () => ({
  send: (...args: unknown[]) => mockSend(...args),
}));

vi.mock('./style.css', () => ({}));

import { ContactUs } from './index';
import { contactConfig } from '../../content_option';

function renderContact() {
  return render(
    <HelmetProvider>
      <ContactUs />
    </HelmetProvider>
  );
}

describe('Contact form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    renderContact();
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Message')).toBeInTheDocument();
  });

  it('updates fields on user input', async () => {
    const user = userEvent.setup();
    renderContact();

    await user.type(screen.getByPlaceholderText('Name'), 'John');
    await user.type(screen.getByPlaceholderText('Email'), 'john@test.com');
    await user.type(screen.getByPlaceholderText('Message'), 'Hello!');

    expect(screen.getByPlaceholderText('Name')).toHaveValue('John');
    expect(screen.getByPlaceholderText('Email')).toHaveValue('john@test.com');
    expect(screen.getByPlaceholderText('Message')).toHaveValue('Hello!');
  });

  it('calls emailjs.send on form submission', async () => {
    mockSend.mockResolvedValueOnce({ status: 200, text: 'OK' });
    const user = userEvent.setup();
    renderContact();

    await user.type(screen.getByPlaceholderText('Name'), 'John');
    await user.type(screen.getByPlaceholderText('Email'), 'john@test.com');
    await user.type(screen.getByPlaceholderText('Message'), 'Hello!');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledWith(
        contactConfig.YOUR_SERVICE_ID,
        contactConfig.YOUR_TEMPLATE_ID,
        expect.objectContaining({
          from_name: 'john@test.com',
          user_name: 'John',
          message: 'Hello!',
        }),
        contactConfig.YOUR_PUBLIC_KEY
      );
    });
  });

  it('shows success message after successful send', async () => {
    mockSend.mockResolvedValueOnce({ status: 200, text: 'OK' });
    const user = userEvent.setup();
    renderContact();

    await user.type(screen.getByPlaceholderText('Name'), 'John');
    await user.type(screen.getByPlaceholderText('Email'), 'john@test.com');
    await user.type(screen.getByPlaceholderText('Message'), 'Hello!');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      const alert = document.querySelector('.co_alert.d-block');
      expect(alert).toBeTruthy();
    });
  });

  it('shows error message on send failure', async () => {
    mockSend.mockRejectedValueOnce({ text: 'Network error' });
    const user = userEvent.setup();
    renderContact();

    await user.type(screen.getByPlaceholderText('Name'), 'John');
    await user.type(screen.getByPlaceholderText('Email'), 'john@test.com');
    await user.type(screen.getByPlaceholderText('Message'), 'Hello!');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      const alert = document.querySelector('.co_alert.d-block');
      expect(alert).toBeTruthy();
    });
  });
});
