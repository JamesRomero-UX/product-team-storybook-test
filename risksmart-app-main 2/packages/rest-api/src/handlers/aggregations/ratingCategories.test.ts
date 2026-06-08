import type { Sdk } from 'generated/graphql2';
import { describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import type { RiskAssessmentResultConfig } from '../risk-assessment-result-config/schema';
import { getRatingCategories } from './ratingCategories';
import type { RatingCategory } from './types';

const { mockGetOrgFeatures } = vi.hoisted(() => ({
  mockGetOrgFeatures: vi.fn(),
}));

vi.mock('src/services/orgUtilities', () => ({
  getOrgFeatures: mockGetOrgFeatures,
}));

vi.mock('@risksmart-app/i18n/src/i18n', () => ({
  default: {
    t: vi.fn((key: string) => {
      if (key === 'risk_uncontrolled') {
        return [
          { label: 'Low', value: 1, range: [0, 4] },
          { label: 'Medium', value: 2, range: [4, 8] },
          { label: 'High', value: 3, range: [8, 12] },
        ] as RatingCategory[];
      }
      if (key === 'risk_controlled') {
        return [
          { label: 'Low', value: 1, range: [0, 3] },
          { label: 'Medium', value: 2, range: [3, 6] },
          { label: 'High', value: 3, range: [6, 9] },
        ] as RatingCategory[];
      }

      return [];
    }),
  },
}));

describe('getRatingCategories', () => {
  it('falls back to i18n categories when no config exists', async () => {
    const apiClient = mock<Sdk>();
    apiClient.getLatestRiskAssessmentResultConfigByOrg.mockResolvedValue({
      risk_assessment_result_config: [],
    });

    const result = await getRatingCategories(apiClient, 'org-key');

    expect(result.inherentRatingCategories).toEqual([
      { label: 'Low', value: 1, range: [0, 4] },
      { label: 'Medium', value: 2, range: [4, 8] },
      { label: 'High', value: 3, range: [8, 12] },
    ]);
    expect(result.residualRatingCategories).toEqual([
      { label: 'Low', value: 1, range: [0, 3] },
      { label: 'Medium', value: 2, range: [3, 6] },
      { label: 'High', value: 3, range: [6, 9] },
    ]);
  });

  it('falls back to i18n when scoring_settings_data feature is absent', async () => {
    mockGetOrgFeatures.mockResolvedValue([]);

    const config = {
      likelihood: {
        ratings: [{ title: 'Rare', value: 1, color: '#22c55e' }],
      },
      impact: {
        categories: [],
        ratings: [{ title: 'Minor', value: 1, color: '#22c55e' }],
        aggregation: 'average',
      },
      matrix: [
        { title: 'Low', value: 1, color: '#22c55e', likelihood: 1, impact: 1 },
      ],
    } satisfies RiskAssessmentResultConfig;

    const apiClient = mock<Sdk>();
    apiClient.getLatestRiskAssessmentResultConfigByOrg.mockResolvedValue({
      risk_assessment_result_config: [
        { Id: '1', Version: 1, Config: config, IsLatest: true },
      ],
    });

    const result = await getRatingCategories(apiClient, 'org-key', 'tenant-1');

    expect(result.inherentRatingCategories).toEqual([
      { label: 'Low', value: 1, range: [0, 4] },
      { label: 'Medium', value: 2, range: [4, 8] },
      { label: 'High', value: 3, range: [8, 12] },
    ]);
    expect(
      apiClient.getLatestRiskAssessmentResultConfigByOrg
    ).not.toHaveBeenCalled();
  });

  it('returns config-based categories when config exists', async () => {
    const config = {
      likelihood: {
        ratings: [
          { title: 'Rare', value: 1, color: '#22c55e' },
          { title: 'Likely', value: 2, color: '#ef4444' },
        ],
      },
      impact: {
        categories: [
          { name: 'Financial', color: '#3b82f6' },
          { name: 'Reputational', color: '#ef4444' },
        ],
        ratings: [
          { title: 'Minor', value: 1, color: '#22c55e' },
          { title: 'Major', value: 2, color: '#ef4444' },
        ],
        aggregation: 'average',
      },
      matrix: [
        { title: 'Low', value: 1, color: '#22c55e', likelihood: 1, impact: 1 },
        { title: 'Low', value: 1, color: '#22c55e', likelihood: 1, impact: 2 },
        {
          title: 'High',
          value: 2,
          color: '#ef4444',
          likelihood: 2,
          impact: 1,
        },
        {
          title: 'High',
          value: 2,
          color: '#ef4444',
          likelihood: 2,
          impact: 2,
        },
      ],
    } satisfies RiskAssessmentResultConfig;

    const apiClient = mock<Sdk>();
    apiClient.getLatestRiskAssessmentResultConfigByOrg.mockResolvedValue({
      risk_assessment_result_config: [
        { Id: '1', Version: 1, Config: config, IsLatest: true },
      ],
    });

    const result = await getRatingCategories(apiClient, 'org-key');

    expect(result.inherentRatingCategories).toEqual([
      {
        label: 'Low',
        value: 1,
        range: [0, 0],
        likelihoodImpact: [{ likelihood: 1, impact: 1 }],
      },
      {
        label: 'Low',
        value: 1,
        range: [0, 0],
        likelihoodImpact: [{ likelihood: 1, impact: 2 }],
      },
      {
        label: 'High',
        value: 2,
        range: [0, 0],
        likelihoodImpact: [{ likelihood: 2, impact: 1 }],
      },
      {
        label: 'High',
        value: 2,
        range: [0, 0],
        likelihoodImpact: [{ likelihood: 2, impact: 2 }],
      },
    ]);
    expect(result.inherentRatingCategories).toEqual(
      result.residualRatingCategories
    );
  });
});
