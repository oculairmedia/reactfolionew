# Testing Guide

## Overview

This repository includes comprehensive unit tests for all JavaScript/JSX files modified in the current branch. The tests follow industry best practices and cover happy paths, edge cases, and failure conditions.

## Quick Start

```bash
# Install dependencies (if not already installed)
npm install

# Run all tests
npm test

# Run tests in watch mode (recommended for development)
npm test -- --watch

# Run tests with coverage report
npm test -- --coverage

# Run a specific test file
npm test cdnHelper.test.js
```

## Test Files

- `src/utils/cdnHelper.test.js` - BunnyCDN image optimization utilities
- `src/components/OptimizedImage/OptimizedImage.test.jsx` - Optimized image component
- `src/components/PortfolioItem.test.js` - Portfolio item component  
- `src/serviceWorker.test.js` - Service worker caching strategies

## Writing New Tests

When adding new functionality:

1. **Follow existing patterns** - Look at existing test files for structure
2. **Test happy paths first** - Ensure core functionality works
3. **Add edge cases** - Test null, undefined, empty values, boundaries
4. **Test error handling** - Verify graceful failure and error messages
5. **Keep tests isolated** - Each test should be independent
6. **Use descriptive names** - Test names should clearly describe what they test
7. **Mock external dependencies** - Keep tests focused and fast

## Test Structure

```javascript
describe('ComponentName or FunctionName', () => {
  describe('Happy Path - Feature Description', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });

  describe('Edge Cases - Description', () => {
    it('should handle edge case', () => {
      // Test implementation
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      // Test implementation
    });
  });
});
```

## Best Practices

1. ✅ **Test behavior, not implementation** - Focus on what the code does, not how
2. ✅ **Keep tests simple** - One assertion per test when possible
3. ✅ **Use meaningful names** - Test names should read like documentation
4. ✅ **Avoid test interdependence** - Tests should pass in any order
5. ✅ **Mock external dependencies** - Keep tests fast and isolated
6. ✅ **Test edge cases** - Null, undefined, empty, boundary values
7. ✅ **Verify accessibility** - Test ARIA attributes, alt text, roles

## Common Testing Utilities

```javascript
// Testing Library utilities
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

// Jest matchers
expect(value).toBe(expected);
expect(value).toEqual(expected);
expect(value).toContain(item);
expect(value).toBeDefined();
expect(value).toHaveBeenCalled();

// Async testing
await waitFor(() => {
  expect(screen.getByText('Loading')).toBeInTheDocument();
});

// Event simulation
fireEvent.click(button);
fireEvent.change(input, { target: { value: 'text' } });
```

## Troubleshooting

### Tests timing out
- Increase timeout: `jest.setTimeout(10000);`
- Check for missing `waitFor` on async operations

### Cannot find element
- Use `screen.debug()` to see rendered output
- Check if element loads asynchronously
- Verify correct query method (getBy vs queryBy vs findBy)

### Mock not working
- Ensure mock is defined before import
- Use `jest.clearAllMocks()` in `beforeEach`
- Check mock path matches actual module path

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## CI/CD Integration

Tests run automatically on:
- Pre-commit (if configured)
- Pull requests
- Before deployment

Ensure all tests pass before merging code.