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
    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/message/i)).toBeInTheDocument();
  });

  it('updates fields on user input', async () => {
    const user = userEvent.setup();
    renderContact();

    await user.type(screen.getByPlaceholderText(/name/i), 'John');
    await user.type(screen.getByPlaceholderText(/email/i), 'john@test.com');
    await user.type(screen.getByPlaceholderText(/message/i), 'Hello!');

    expect(screen.getByPlaceholderText(/name/i)).toHaveValue('John');
    expect(screen.getByPlaceholderText(/email/i)).toHaveValue('john@test.com');
    expect(screen.getByPlaceholderText(/message/i)).toHaveValue('Hello!');
  });

  it('calls emailjs.send on form submission', async () => {
    mockSend.mockResolvedValueOnce({ status: 200, text: 'OK' });
    const user = userEvent.setup();
    renderContact();

    await user.type(screen.getByPlaceholderText(/name/i), 'John');
    await user.type(screen.getByPlaceholderText(/email/i), 'john@test.com');
    await user.type(screen.getByPlaceholderText(/message/i), 'Hello!');
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

    await user.type(screen.getByPlaceholderText(/name/i), 'John');
    await user.type(screen.getByPlaceholderText(/email/i), 'john@test.com');
    await user.type(screen.getByPlaceholderText(/message/i), 'Hello!');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveClass('alert-success');
      expect(screen.getByRole('alert')).toHaveTextContent(/message sent successfully/i);
    });
  });

  it('shows error message on send failure', async () => {
    mockSend.mockRejectedValueOnce({ text: 'Network error' });
    const user = userEvent.setup();
    renderContact();

    await user.type(screen.getByPlaceholderText(/name/i), 'John');
    await user.type(screen.getByPlaceholderText(/email/i), 'john@test.com');
    await user.type(screen.getByPlaceholderText(/message/i), 'Hello!');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveClass('alert-error');
      expect(screen.getByRole('alert')).toHaveTextContent(/failed to send/i);
    });
  });
});
