import type { UseRatingResponse } from '@risksmart-app/components/src/hooks/useRating';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { renderHook } from '@testing-library/react';
import { when } from 'jest-when';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';

import { useCalculateRiskRating } from './useCalculateRiskRating';
import type { MatrixCell } from './useScoringSettings';

vi.mock('@risksmart-app/components/src/hooks/useRating');
const mockedUseRating = vi.mocked(useRating);

const { mockUseScoringSettings } = vi.hoisted(() => ({
  mockUseScoringSettings: vi.fn(),
}));
vi.mock('./useScoringSettings', () => ({
  useScoringSettings: mockUseScoringSettings,
}));

vi.mock('@/utils/errorUtils');

const noScoringSettings = () => {
  mockUseScoringSettings.mockReturnValue({
    hasScoringSettings: false,
    getRatingByLikelihoodAndImpact: () => undefined,
  });
};

describe('useCalculateRiskRating', () => {
  beforeEach(() => {
    noScoringSettings();
  });

  it.each([
    {
      impact: 1,
      likelihood: 2,
      expectedValue: 1,
    },
    {
      impact: 3,
      likelihood: 3,
      expectedValue: 1,
    },
    {
      impact: 2,
      likelihood: 5,
      expectedValue: 2,
    },
  ])(
    'should return the value ($expectedValue) option with the range that covers the result of impact ($impact) * likelihood ($likelihood)',
    ({ impact, likelihood, expectedValue }) => {
      when(mockedUseRating)
        .calledWith('risk_controlled')
        .mockReturnValue(
          stub<UseRatingResponse>({
            options: [
              {
                range: [0, 9],
                value: 1,
              },
              {
                range: [10, 20],
                value: 2,
              },
              {
                range: [21, 30],
                value: 3,
              },
            ],
          })
        );
      const { result } = renderHook(() =>
        useCalculateRiskRating(
          Risk_Assessment_Result_Control_Type_Enum.Controlled
        )
      );

      const rating = result.current({
        impact,
        likelihood,
      });
      expect(rating.value).toEqual(expectedValue);
    }
  );

  describe('when likelihoodImpact array set on rating taxonomy', () => {
    beforeEach(() => {
      when(mockedUseRating)
        .calledWith('risk_controlled')
        .mockReturnValue(
          stub<UseRatingResponse>({
            options: [
              {
                range: [0, 9],
                value: 1,
                likelihoodImpact: [
                  {
                    likelihood: 2,
                    impact: 1,
                  },
                  {
                    likelihood: 3,
                    impact: 3,
                  },
                ],
              },
              {
                range: [10, 20],
                value: 2,
                likelihoodImpact: [
                  {
                    likelihood: 5,
                    impact: 2,
                  },
                ],
              },
              {
                range: [21, 30],
                value: 3,
                likelihoodImpact: [],
              },
            ],
          })
        );
    });

    it.each([
      {
        impact: 1,
        likelihood: 2,
        expectedValue: 1,
      },
      {
        impact: 3,
        likelihood: 3,
        expectedValue: 1,
      },
      {
        impact: 2,
        likelihood: 5,
        expectedValue: 2,
      },
    ])(
      'should use the likelihoodImpact array to find an exact value match ($expectedValue) using likehood ($likelihood) and impact ($impact) match',
      ({ impact, likelihood, expectedValue }) => {
        const { result } = renderHook(() =>
          useCalculateRiskRating(
            Risk_Assessment_Result_Control_Type_Enum.Controlled
          )
        );
        const rating = result.current({
          impact,
          likelihood,
        });
        expect(rating.value).toEqual(expectedValue);
      }
    );

    it('should return "unknown" if no matching value is found', () => {
      const { result } = renderHook(() =>
        useCalculateRiskRating(
          Risk_Assessment_Result_Control_Type_Enum.Controlled
        )
      );
      const rating = result.current({
        impact: 20,
        likelihood: 21,
      });
      expect(rating.value).toEqual(0);
      expect(rating.label).toEqual('Unknown');
      expect(rating.color).toBeUndefined();
    });
  });

  describe('when scoring settings config exists', () => {
    const matrixCells: Record<string, MatrixCell> = {
      '1:1': {
        label: 'Low',
        value: 1,
        color: '#16a34a',
        likelihood: 1,
        impact: 1,
      },
      '2:2': {
        label: 'High',
        value: 4,
        color: '#dc2626',
        likelihood: 2,
        impact: 2,
      },
    };

    beforeEach(() => {
      mockUseScoringSettings.mockReturnValue({
        hasScoringSettings: true,
        getRatingByLikelihoodAndImpact: (likelihood: number, impact: number) =>
          matrixCells[`${likelihood}:${impact}`],
      });
    });

    it('returns the matrix cell for a matching likelihood/impact', () => {
      const { result } = renderHook(() =>
        useCalculateRiskRating(
          Risk_Assessment_Result_Control_Type_Enum.Controlled
        )
      );
      const rating = result.current({ likelihood: 2, impact: 2 });
      expect(rating).toEqual({
        label: 'High',
        value: 4,
        color: '#dc2626',
      });
    });

    it('ignores controlType — same result for controlled and uncontrolled', () => {
      when(mockedUseRating)
        .calledWith('risk_controlled')
        .mockReturnValue(stub<UseRatingResponse>({ options: [] }));
      when(mockedUseRating)
        .calledWith('risk_uncontrolled')
        .mockReturnValue(stub<UseRatingResponse>({ options: [] }));

      const { result: controlled } = renderHook(() =>
        useCalculateRiskRating(
          Risk_Assessment_Result_Control_Type_Enum.Controlled
        )
      );
      const { result: uncontrolled } = renderHook(() =>
        useCalculateRiskRating(
          Risk_Assessment_Result_Control_Type_Enum.Uncontrolled
        )
      );
      expect(controlled.current({ likelihood: 1, impact: 1 })).toEqual(
        uncontrolled.current({ likelihood: 1, impact: 1 })
      );
    });

    it('returns Unknown for a non-existent combination', () => {
      const { result } = renderHook(() =>
        useCalculateRiskRating(
          Risk_Assessment_Result_Control_Type_Enum.Controlled
        )
      );
      const rating = result.current({ likelihood: 99, impact: 99 });
      expect(rating).toEqual({
        label: 'Unknown',
        value: 0,
        color: undefined,
      });
    });
  });
});
