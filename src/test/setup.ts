import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

vi.mock('*.css', () => ({}));

// jsdom lacks scrollIntoView — stub it globally
Element.prototype.scrollIntoView = vi.fn();
