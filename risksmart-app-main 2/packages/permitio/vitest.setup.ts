import { afterEach, beforeEach, vi } from 'vitest';

// Mock global fetch for all tests
global.fetch = vi.fn();

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
  vi.useRealTimers();
});

beforeEach(() => {
  vi.useFakeTimers();
});

// Suppress unhandled promise rejection warnings in tests
const originalConsoleWarn = console.warn;
beforeEach(() => {
  console.warn = (message: string, ...args) => {
    if (message.includes('PromiseRejectionHandledWarning')) {
      return; // Suppress these warnings in tests
    }
    originalConsoleWarn(message, ...args);
  };
});

afterEach(() => {
  console.warn = originalConsoleWarn;
});
