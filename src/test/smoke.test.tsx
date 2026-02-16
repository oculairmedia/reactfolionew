import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';

// Mock CMS API calls — resolve immediately so loading states clear
vi.mock('../utils/payloadApi', () => ({
  getPortfolioItems: vi.fn().mockResolvedValue([]),
  getAboutPage: vi.fn().mockResolvedValue(null),
  getHomeIntro: vi.fn().mockResolvedValue(null),
  getSiteSettings: vi.fn().mockResolvedValue(null),
  getProjectById: vi.fn().mockResolvedValue(null),
}));

// Mock Ghost API
vi.mock('../services/ghostApi', () => ({
  getPosts: vi.fn().mockResolvedValue([]),
  getPostBySlug: vi.fn().mockResolvedValue(null),
  isGhostConfigured: false,
}));

// Mock CSS imports
vi.mock('../pages/home/style.css', () => ({}));
vi.mock('../pages/portfolio/style.css', () => ({}));
vi.mock('../pages/about/style.css', () => ({}));
vi.mock('../pages/blog/style.css', () => ({}));
vi.mock('../pages/contact/style.css', () => ({}));
vi.mock('../header/style.css', () => ({}));
vi.mock('../components/themetoggle/style.css', () => ({}));
vi.mock('../components/socialicons/style.css', () => ({}));
vi.mock('../components/OptimizedVideo/OptimizedVideo.css', () => ({}));

// Mock emailjs
vi.mock('emailjs-com', () => ({
  send: vi.fn().mockResolvedValue({ status: 200, text: 'OK' }),
}));

// Mock typewriter-effect
vi.mock('typewriter-effect', () => ({
  default: () => <div data-testid="typewriter">Typewriter</div>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    section: 'section',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useInView: () => true,
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => ({ get: () => 1 }),
}));

// Mock TanStack Router hooks for components that use them outside RouterProvider
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ slug: 'test-slug' }),
    useNavigate: vi.fn().mockReturnValue(vi.fn()),
  };
});

function wrap(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <HelmetProvider>{children}</HelmetProvider>
    ),
  });
}

describe('Route smoke tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
  });

  it('Home page renders without crashing', async () => {
    const { Home } = await import('../pages/home');
    const { container } = wrap(<Home />);
    expect(container.querySelector('.intro_sec')).toBeTruthy();
  });

  it('Portfolio page renders and shows content after loading', async () => {
    const { Portfolio } = await import('../pages/portfolio');
    wrap(<Portfolio />);
    // Initially shows skeleton, wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText('No portfolio items available')).toBeTruthy();
    });
  });

  it('About page renders without crashing', async () => {
    const { About } = await import('../pages/about');
    const { container } = wrap(<About />);
    // Renders skeleton or content — just verify it mounts
    expect(container.querySelector('.About-header')).toBeTruthy();
  });

  it('Blog page renders with unconfigured state', async () => {
    const { Blog } = await import('../pages/blog');
    wrap(<Blog />);
    expect(screen.getByRole('heading', { name: /blog/i })).toBeTruthy();
  });

  it('Contact page renders form fields', async () => {
    const { ContactUs } = await import('../pages/contact');
    wrap(<ContactUs />);
    expect(screen.getByPlaceholderText('Name')).toBeTruthy();
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Message')).toBeTruthy();
  });

  it('BlogPost page renders without crashing (ghost unconfigured)', async () => {
    const { BlogPost } = await import('../pages/blog/BlogPost');
    wrap(<BlogPost />);
    expect(screen.getByText(/under construction/i)).toBeTruthy();
  });
});
