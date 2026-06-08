import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import type { FeatureFlagKey } from '@/utils/featureFlags';
import { isFeatureEnabled } from '@/utils/featureFlags';

import FeatureFlaggedRoute from './FeatureFlaggedRoute';

vi.mock('@/utils/featureFlags');

const isFeatureEnabledMock = vi.mocked(isFeatureEnabled);

describe('FeatureFlaggedRoute', () => {
  const child = 'Test';
  const testFeatureFlag: FeatureFlagKey = 'REACT_APP_FEATURE_posture';

  it('should throw error if feature flag not enabled', () => {
    isFeatureEnabledMock.mockImplementation(() => {
      return false;
    });

    expect(() =>
      render(
        <MemoryRouter>
          <FeatureFlaggedRoute featureFlag={testFeatureFlag}>
            {child}
          </FeatureFlaggedRoute>
        </MemoryRouter>
      )
    ).toThrowError('Access to REACT_APP_FEATURE_posture denied');
  });

  it('should render children is feature flag enabled', () => {
    isFeatureEnabledMock.mockImplementation((featureFlag) => {
      if (featureFlag === testFeatureFlag) {
        return true;
      }

      return false;
    });

    render(
      <FeatureFlaggedRoute featureFlag={testFeatureFlag}>
        {child}
      </FeatureFlaggedRoute>
    );
    expect(screen.queryByText(child)).toBeDefined();
  });
});
