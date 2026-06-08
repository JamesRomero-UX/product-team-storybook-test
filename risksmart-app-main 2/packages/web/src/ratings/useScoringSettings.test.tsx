import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { RiskAssessmentResultConfig } from '@/hooks/queries/risk-assessment-result-config/useGetLatestRiskAssessmentResultConfig';

import { useScoringSettings } from './useScoringSettings';

const {
  mockUseGetLatestRiskAssessmentResultConfig,
  mockUseIsFeatureFlagEnabled,
} = vi.hoisted(() => ({
  mockUseGetLatestRiskAssessmentResultConfig: vi.fn(),
  mockUseIsFeatureFlagEnabled: vi.fn().mockReturnValue(true),
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

describe('useScoringSettings', () => {
  it('returns populated arrays when config exists', () => {
    const config = buildConfig();
    mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
      config,
      loading: false,
    });

    const { result } = renderHook(() => useScoringSettings());

    expect(result.current.hasScoringSettings).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.config).toBe(config);

    expect(result.current.matrixOptions).toEqual([
      {
        label: 'Low',
        value: 1,
        color: '#16a34a',
        likelihoodImpact: [{ likelihood: 1, impact: 1 }],
        range: [0, 0],
      },
      {
        label: 'Low',
        value: 1,
        color: '#16a34a',
        likelihoodImpact: [{ likelihood: 1, impact: 2 }],
        range: [0, 0],
      },
      {
        label: 'High',
        value: 2,
        color: '#dc2626',
        likelihoodImpact: [{ likelihood: 2, impact: 1 }],
        range: [0, 0],
      },
      {
        label: 'High',
        value: 2,
        color: '#dc2626',
        likelihoodImpact: [{ likelihood: 2, impact: 2 }],
        range: [0, 0],
      },
    ]);

    expect(result.current.likelihoodOptions).toEqual([
      { label: 'Rare', value: 1, color: '#16a34a' },
      { label: 'Likely', value: 2, color: '#f87171' },
    ]);

    expect(result.current.impactOptions).toEqual([
      { label: 'Minor', value: 1, color: '#16a34a' },
      { label: 'Major', value: 2, color: '#dc2626' },
    ]);

    expect(result.current.impactCategories).toEqual([
      { name: 'Financial', color: '#3b82f6' },
      { name: 'Operational', color: '#a855f7' },
    ]);
  });

  it('returns empty arrays when no config exists', () => {
    mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
      config: undefined,
      loading: false,
    });

    const { result } = renderHook(() => useScoringSettings());

    expect(result.current.hasScoringSettings).toBe(false);
    expect(result.current.config).toBeUndefined();
    expect(result.current.matrixOptions).toEqual([]);
    expect(result.current.likelihoodOptions).toEqual([]);
    expect(result.current.impactOptions).toEqual([]);
    expect(result.current.impactCategories).toEqual([]);
  });

  it('returns hasScoringSettings false when scoring_settings_data flag is disabled', () => {
    const config = buildConfig();
    mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
      config,
      loading: false,
    });
    mockUseIsFeatureFlagEnabled.mockReturnValue(false);

    const { result } = renderHook(() => useScoringSettings());

    expect(result.current.hasScoringSettings).toBe(false);
    expect(result.current.config).toBeUndefined();
    expect(result.current.matrixOptions).toEqual([]);
    expect(result.current.likelihoodOptions).toEqual([]);
    expect(result.current.impactOptions).toEqual([]);
    expect(result.current.impactCategories).toEqual([]);

    mockUseIsFeatureFlagEnabled.mockReturnValue(true);
  });

  it('returns hasScoringSettings false while loading', () => {
    const config = buildConfig();
    mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
      config,
      loading: true,
    });

    const { result } = renderHook(() => useScoringSettings());

    expect(result.current.hasScoringSettings).toBe(false);
    expect(result.current.loading).toBe(true);
  });

  describe('getRatingByLikelihoodAndImpact', () => {
    it('returns the matching matrix cell', () => {
      mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
        config: buildConfig(),
        loading: false,
      });
      const { result } = renderHook(() => useScoringSettings());

      expect(result.current.getRatingByLikelihoodAndImpact(2, 1)).toEqual({
        label: 'High',
        value: 2,
        color: '#dc2626',
        likelihood: 2,
        impact: 1,
      });
    });

    it('returns undefined for a non-existent combination', () => {
      mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
        config: buildConfig(),
        loading: false,
      });
      const { result } = renderHook(() => useScoringSettings());

      expect(
        result.current.getRatingByLikelihoodAndImpact(99, 99)
      ).toBeUndefined();
    });

    it('returns undefined when no config', () => {
      mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
        config: undefined,
        loading: false,
      });
      const { result } = renderHook(() => useScoringSettings());

      expect(
        result.current.getRatingByLikelihoodAndImpact(1, 1)
      ).toBeUndefined();
    });
  });

  describe('getLikelihoodByValue', () => {
    it('returns the matching likelihood option', () => {
      mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
        config: buildConfig(),
        loading: false,
      });
      const { result } = renderHook(() => useScoringSettings());

      expect(result.current.getLikelihoodByValue(1)).toEqual({
        label: 'Rare',
        value: 1,
        color: '#16a34a',
      });
    });

    it('returns undefined for a non-existent value', () => {
      mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
        config: buildConfig(),
        loading: false,
      });
      const { result } = renderHook(() => useScoringSettings());

      expect(result.current.getLikelihoodByValue(99)).toBeUndefined();
    });

    it('returns undefined when no config', () => {
      mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
        config: undefined,
        loading: false,
      });
      const { result } = renderHook(() => useScoringSettings());

      expect(result.current.getLikelihoodByValue(1)).toBeUndefined();
    });
  });

  describe('ratingLevelOptions', () => {
    it('deduplicates matrix entries by value and sorts ascending', () => {
      mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
        config: buildConfig(),
        loading: false,
      });
      const { result } = renderHook(() => useScoringSettings());

      expect(result.current.ratingLevelOptions).toEqual([
        { label: 'Low', value: 1, color: '#16a34a' },
        { label: 'High', value: 2, color: '#dc2626' },
      ]);
    });

    it('keeps first occurrence when duplicates exist', () => {
      const config = buildConfig();
      // Override matrix so value 1 appears with two different labels
      config.matrix = [
        {
          title: 'Medium',
          value: 2,
          color: '#f59e0b',
          likelihood: 1,
          impact: 1,
        },
        {
          title: 'Low',
          value: 1,
          color: '#16a34a',
          likelihood: 1,
          impact: 2,
        },
        {
          title: 'Also Medium',
          value: 2,
          color: '#eab308',
          likelihood: 2,
          impact: 1,
        },
      ];
      mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
        config,
        loading: false,
      });
      const { result } = renderHook(() => useScoringSettings());

      expect(result.current.ratingLevelOptions).toEqual([
        { label: 'Low', value: 1, color: '#16a34a' },
        { label: 'Medium', value: 2, color: '#f59e0b' },
      ]);
    });

    it('returns empty array when no config', () => {
      mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
        config: undefined,
        loading: false,
      });
      const { result } = renderHook(() => useScoringSettings());

      expect(result.current.ratingLevelOptions).toEqual([]);
    });
  });

  describe('getImpactByValue', () => {
    it('returns the matching impact option', () => {
      mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
        config: buildConfig(),
        loading: false,
      });
      const { result } = renderHook(() => useScoringSettings());

      expect(result.current.getImpactByValue(2)).toEqual({
        label: 'Major',
        value: 2,
        color: '#dc2626',
      });
    });

    it('returns undefined for a non-existent value', () => {
      mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
        config: buildConfig(),
        loading: false,
      });
      const { result } = renderHook(() => useScoringSettings());

      expect(result.current.getImpactByValue(99)).toBeUndefined();
    });

    it('returns undefined when no config', () => {
      mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
        config: undefined,
        loading: false,
      });
      const { result } = renderHook(() => useScoringSettings());

      expect(result.current.getImpactByValue(1)).toBeUndefined();
    });
  });

  describe('memoisation stability', () => {
    it('returns stable function references across re-renders', () => {
      mockUseGetLatestRiskAssessmentResultConfig.mockReturnValue({
        config: buildConfig(),
        loading: false,
      });
      const { result, rerender } = renderHook(() => useScoringSettings());

      const first = {
        getRatingByLikelihoodAndImpact:
          result.current.getRatingByLikelihoodAndImpact,
        getLikelihoodByValue: result.current.getLikelihoodByValue,
        getImpactByValue: result.current.getImpactByValue,
      };

      rerender();

      expect(result.current.getRatingByLikelihoodAndImpact).toBe(
        first.getRatingByLikelihoodAndImpact
      );
      expect(result.current.getLikelihoodByValue).toBe(
        first.getLikelihoodByValue
      );
      expect(result.current.getImpactByValue).toBe(first.getImpactByValue);
    });
  });
});
