import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { RiskAssessmentResultConfig } from '@/hooks/queries/risk-assessment-result-config/useGetLatestRiskAssessmentResultConfig';

import { useRiskRatingResolver } from './useRiskRatingResolver';

const {
  mockUseGetLatestRiskAssessmentResultConfig,
  mockUseIsFeatureFlagEnabled,
  mockUseRating,
} = vi.hoisted(() => ({
  mockUseGetLatestRiskAssessmentResultConfig: vi.fn(),
  mockUseIsFeatureFlagEnabled: vi.fn().mockReturnValue(true),
  mockUseRating: vi.fn(),
}));

vi.mock(
  '@/hooks/queries/risk-assessment-result-config/useGetLatestRiskAssessmentResultConfig',
  () => ({
    useGetLatestRiskAssessmentResultConfig:
      mockUseGetLatestRiskAssessmentResultConfig,
  })
);

vi.mock('@/hooks/useIsFeatureFlagEnabled', () => ({
  useIsFeatureFlagEnabled: mockUseIsFeatureFlagEnabled,
}));

vi.mock('@risksmart-app/components/src/hooks/useRating', () => ({
  useRating: mockUseRating,
}));

const buildConfig = (): RiskAssessmentResultConfig => ({
  likelihood: {
    ratings: [
      { title: 'Rare', value: 1, color: '#16a34a' },
      { title: 'Likely', value: 2, color: '#f87171' },
    ],
  },
  impact: {
    categories: [
      { name: 'Financial', color: '#3b82f6' },
      { name: 'Operational', color: '#a855f7' },
    ],
    ratings: [
      { title: 'Minor', value: 1, color: '#16a34a' },
      { title: 'Major', value: 2, color: '#dc2626' },
    ],
    aggregation: 'average',
  },
  matrix: [
    { title: 'Low', value: 1, color: '#16a34a', likelihood: 1, impact: 1 },
    { title: 'Low', value: 1, color: '#16a34a', likelihood: 1, impact: 2 },
    { title: 'High', value: 2, color: '#dc2626', likelihood: 2, impact: 1 },
    { title: 'High', value: 2, color: '#dc2626', likelihood: 2, impact: 2 },
  ],
});

const taxonomyOptions = {
  risk_controlled: [
    { label: 'Low', value: 1, color: 'green' },
    { label: 'High', value: 2, color: 'red' },
  ],
  risk_uncontrolled: [
    { label: 'Low', value: 1, color: 'green' },
    { label: 'Medium', value: 2, color: 'orange' },
    { label: 'High', value: 3, color: 'red' },
  ],
  likelihood: [
    { label: 'Unlikely', value: 1, color: 'green' },
    { label: 'Possible', value: 2, color: 'orange' },
  ],
  impact: [
    { label: 'Insignificant', value: 1, color: 'green' },
    { label: 'Moderate', value: 2, color: 'orange' },
  ],
};

const setupMockUseRating = () => {
  mockUseRating.mockImplementation((key: string) => {
    const options = taxonomyOptions[key as keyof typeof taxonomyOptions] ?? [];

    return {
      options,
      getByValue: (v: number | null | string | undefined) =>
        options.find((o) => o.value === v),
      getLabel: (v: number | null | string | undefined) =>
        options.find((o) => o.value === v)?.label ?? '',
      getColorClass: () => null,
      getByLabel: () => undefined,
      getByRange: () => undefined,
      getOptionsByRatingKey: () => [],
      getByValueAndRatingKey: () => undefined,
      getLabelByIndex: () => '',
      getIndexByValue: () => undefined,
    };
  });
};

describe('useRiskRatingResolver', () => {
  describe('with scoring settings active', () => {
    beforeEach(() => {
      mockUseIsFeatureFlagEnabled.mockReturnValue(true);
      mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
        config: buildConfig(),
        loading: false,
      });
      setupMockUseRating();
    });

    it('resolveRiskRating returns matrix cell for valid likelihood+impact', () => {
      const { result } = renderHook(() => useRiskRatingResolver());

      const resolved = result.current.resolveRiskRating({
        likelihood: 2,
        impact: 1,
        controlType: Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
        rating: 3,
      });

      expect(resolved).toEqual({
        label: 'High',
        value: 2,
        color: '#dc2626',
      });
    });

    it('resolveRiskRating returns undefined when likelihood/impact missing', () => {
      const { result } = renderHook(() => useRiskRatingResolver());

      expect(
        result.current.resolveRiskRating({
          likelihood: null,
          impact: 1,
          controlType: Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
          rating: 1,
        })
      ).toBeUndefined();
    });

    it('resolveRiskRating returns undefined for non-existent matrix combination', () => {
      const { result } = renderHook(() => useRiskRatingResolver());

      expect(
        result.current.resolveRiskRating({
          likelihood: 99,
          impact: 99,
          controlType: Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
          rating: 1,
        })
      ).toBeUndefined();
    });

    it('resolveImpact returns scoring settings impact', () => {
      const { result } = renderHook(() => useRiskRatingResolver());

      expect(result.current.resolveImpact(2)).toEqual({
        label: 'Major',
        value: 2,
        color: '#dc2626',
      });
    });

    it('resolveLikelihood returns scoring settings likelihood', () => {
      const { result } = renderHook(() => useRiskRatingResolver());

      expect(result.current.resolveLikelihood(1)).toEqual({
        label: 'Rare',
        value: 1,
        color: '#16a34a',
      });
    });

    it('resolveImpact returns undefined for null', () => {
      const { result } = renderHook(() => useRiskRatingResolver());
      expect(result.current.resolveImpact(null)).toBeUndefined();
    });

    it('resolveLikelihood returns undefined for undefined', () => {
      const { result } = renderHook(() => useRiskRatingResolver());
      expect(result.current.resolveLikelihood(undefined)).toBeUndefined();
    });

    it('hasScoringSettings is true', () => {
      const { result } = renderHook(() => useRiskRatingResolver());
      expect(result.current.hasScoringSettings).toBe(true);
    });

    it('options contain scoring settings options', () => {
      const { result } = renderHook(() => useRiskRatingResolver());
      expect(result.current.options.likelihood).toEqual([
        { label: 'Rare', value: 1, color: '#16a34a' },
        { label: 'Likely', value: 2, color: '#f87171' },
      ]);
      expect(result.current.options.impact).toEqual([
        { label: 'Minor', value: 1, color: '#16a34a' },
        { label: 'Major', value: 2, color: '#dc2626' },
      ]);
      expect(result.current.options.ratingLevel).toEqual([
        { label: 'Low', value: 1, color: '#16a34a' },
        { label: 'High', value: 2, color: '#dc2626' },
      ]);
    });
  });

  describe('with taxonomy fallback (no scoring settings)', () => {
    beforeEach(() => {
      mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
        config: undefined,
        loading: false,
      });
      setupMockUseRating();
    });

    it('resolveRiskRating returns controlled taxonomy rating', () => {
      const { result } = renderHook(() => useRiskRatingResolver());

      const resolved = result.current.resolveRiskRating({
        likelihood: 1,
        impact: 1,
        controlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
        rating: 1,
      });

      expect(resolved).toEqual({
        label: 'Low',
        value: 1,
        color: 'green',
      });
    });

    it('resolveRiskRating returns uncontrolled taxonomy rating', () => {
      const { result } = renderHook(() => useRiskRatingResolver());

      const resolved = result.current.resolveRiskRating({
        likelihood: 1,
        impact: 1,
        controlType: Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
        rating: 3,
      });

      expect(resolved).toEqual({
        label: 'High',
        value: 3,
        color: 'red',
      });
    });

    it('resolveRiskRating returns undefined for unknown rating value', () => {
      const { result } = renderHook(() => useRiskRatingResolver());

      expect(
        result.current.resolveRiskRating({
          likelihood: 1,
          impact: 1,
          controlType: Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
          rating: 99,
        })
      ).toBeUndefined();
    });

    it('resolveImpact returns taxonomy impact', () => {
      const { result } = renderHook(() => useRiskRatingResolver());

      expect(result.current.resolveImpact(2)).toEqual({
        label: 'Moderate',
        value: 2,
        color: 'orange',
      });
    });

    it('resolveLikelihood returns taxonomy likelihood', () => {
      const { result } = renderHook(() => useRiskRatingResolver());

      expect(result.current.resolveLikelihood(1)).toEqual({
        label: 'Unlikely',
        value: 1,
        color: 'green',
      });
    });

    it('hasScoringSettings is false', () => {
      const { result } = renderHook(() => useRiskRatingResolver());
      expect(result.current.hasScoringSettings).toBe(false);
    });
  });

  describe('memoisation stability', () => {
    it('returns stable references when deps are stable', () => {
      const stableGetByValue = (v: number | null | string | undefined) =>
        taxonomyOptions.risk_controlled.find((o) => o.value === v);

      mockUseRating.mockReturnValue({
        options: [],
        getByValue: stableGetByValue,
        getLabel: () => '',
        getColorClass: () => null,
        getByLabel: () => undefined,
        getByRange: () => undefined,
        getOptionsByRatingKey: () => [],
        getByValueAndRatingKey: () => undefined,
        getLabelByIndex: () => '',
        getIndexByValue: () => undefined,
      });
      mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
        config: buildConfig(),
        loading: false,
      });

      const { result, rerender } = renderHook(() => useRiskRatingResolver());

      const first = {
        resolveRiskRating: result.current.resolveRiskRating,
        resolveImpact: result.current.resolveImpact,
        resolveLikelihood: result.current.resolveLikelihood,
      };

      rerender();

      expect(result.current.resolveRiskRating).toBe(first.resolveRiskRating);
      expect(result.current.resolveImpact).toBe(first.resolveImpact);
      expect(result.current.resolveLikelihood).toBe(first.resolveLikelihood);
    });
  });
});
