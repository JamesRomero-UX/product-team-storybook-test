import '@testing-library/jest-dom';

import { init } from '@risksmart-app/i18n/src/i18n';
import { vi } from 'vitest';

init();

// Provide a default mock for the getEntities query used by useEntityPath
vi.mock('@risksmart-app/web-graphql-client/generated/graphql', async () => {
  const actual = await vi.importActual<
    typeof import('@risksmart-app/web-graphql-client/generated/graphql')
  >('@risksmart-app/web-graphql-client/generated/graphql');

  return {
    ...actual,
    // Default to empty entity list; individual tests can override this mock
    useGetEntitiesQuery: vi.fn().mockReturnValue({ data: { entity: [] } }),
  };
});

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
