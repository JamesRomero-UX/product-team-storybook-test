import { describe, expect, it, vi } from 'vitest';

vi.mock('@risksmart-app/components/src/utils/environment', () => ({
  getEnv: vi.fn(),
}));

import { getEnv } from '@risksmart-app/components/src/utils/environment';

import { isFeatureEnabled } from './featureFlags';

const mockGetEnv = getEnv as unknown as ReturnType<
  typeof vi.fn<(...args: unknown[]) => string | undefined>
>;

describe('featureFlags', () => {
  describe('isFeatureEnabled', () => {
    it('returns true when env var is "true"', () => {
      mockGetEnv.mockReturnValue('true');

      expect(isFeatureEnabled('REACT_APP_FEATURE_modules')).toBe(true);
      expect(mockGetEnv).toHaveBeenCalledWith(
        'REACT_APP_FEATURE_modules',
        true
      );
    });

    it('returns false when env var is undefined', () => {
      mockGetEnv.mockReturnValue(undefined);

      expect(isFeatureEnabled('REACT_APP_FEATURE_modules')).toBe(false);
    });

    it('returns false when env var is "false"', () => {
      mockGetEnv.mockReturnValue('false');

      expect(isFeatureEnabled('REACT_APP_FEATURE_modules')).toBe(false);
    });
  });
});
