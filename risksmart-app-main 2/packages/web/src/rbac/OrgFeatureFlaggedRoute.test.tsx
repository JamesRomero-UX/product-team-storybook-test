import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import OrgFeatureFlaggedRoute from './OrgFeatureFlaggedRoute';

const { mockFeatures } = vi.hoisted(() => ({
  mockFeatures: vi.fn().mockReturnValue([]),
}));

vi.mock('src/rbac/useFeatures', () => ({
  useFeatures: mockFeatures,
}));

describe('OrgFeatureFlaggedRoute', () => {
  const child = 'Test';

  it('should throw error if feature flag not enabled', () => {
    mockFeatures.mockReturnValue([]);

    expect(() =>
      render(
        <MemoryRouter>
          <OrgFeatureFlaggedRoute featureFlag={'trpc'}>
            {child}
          </OrgFeatureFlaggedRoute>
        </MemoryRouter>
      )
    ).toThrowError('Access to feature trpc denied');
  });

  it('should render fallback if set, and if feature flag not enabled', () => {
    mockFeatures.mockReturnValue([]);
    const fallback = 'Fallback';
    render(
      <MemoryRouter>
        <OrgFeatureFlaggedRoute fallback={<>{fallback}</>} featureFlag={'trpc'}>
          {child}
        </OrgFeatureFlaggedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText(fallback)).toBeDefined();
  });

  it('should render children when feature flag is enabled', () => {
    mockFeatures.mockReturnValue(['trpc']);

    render(
      <OrgFeatureFlaggedRoute featureFlag={'trpc'}>
        {child}
      </OrgFeatureFlaggedRoute>
    );
    expect(screen.queryByText(child)).toBeDefined();
  });
});
