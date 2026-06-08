import '@testing-library/jest-dom';

import { init } from '@risksmart-app/i18n/src/i18n';
init();

const CONSOLE_FAIL_TYPES = ['error', 'warn'] as const;

beforeEach(() => {
  // Fail tests on unexpected warnings and errors
  CONSOLE_FAIL_TYPES.forEach((type) => {
    console[type] = (message) => {
      throw new Error(
        `Failing due to console.${type} while running test!\n\n${message}`
      );
    };
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
