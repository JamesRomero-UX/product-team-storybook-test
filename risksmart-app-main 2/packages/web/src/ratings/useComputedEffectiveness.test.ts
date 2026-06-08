import type { UseRatingResponse } from '@risksmart-app/components/src/hooks/useRating';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { renderHook } from '@testing-library/react';
import { when } from 'jest-when';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';

import { useComputedEffectiveness } from './useComputedEffectiveness';

vi.mock('@risksmart-app/components/src/hooks/useRating');
const mockedUseRating = vi.mocked(useRating);

describe('useComputedEffectiveness', () => {
  beforeEach(() => {
    when(mockedUseRating)
      .calledWith('effectiveness')
      .mockReturnValue(
        stub<UseRatingResponse>({
          options: [
            {
              range: [0, 50],
              value: 1,
            },
            {
              range: [51, 100],
              value: 2,
            },
            {
              range: [101, 150],
              value: 3,
            },
          ],
        })
      );
  });

  it.each([
    { design: 2, performance: 10, expectedValue: 1 },
    { design: 7, performance: 8, expectedValue: 2 },
    { design: 10, performance: 11, expectedValue: 3 },
  ])(
    'should return the correct value ($expectedValue) for design ($design) and performance ($performance)',
    ({ design, performance, expectedValue }) => {
      const { result } = renderHook(() =>
        useComputedEffectiveness({ design, performance })
      );

      expect(result.current).toEqual(expectedValue);
    }
  );

  it('should return undefined if no matching range is found', () => {
    const { result } = renderHook(() =>
      useComputedEffectiveness({ design: 20, performance: 10 })
    );

    expect(result.current).toBeNaN(); // since the function returns Number(undefined), which results in NaN
  });
});
