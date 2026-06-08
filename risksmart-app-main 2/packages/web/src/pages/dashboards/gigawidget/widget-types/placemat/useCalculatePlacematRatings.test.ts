import type { GetImpactRatingsWithAppetitesQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { renderHook } from '@testing-library/react';

import { stub } from '../../../../../testing/stub';
import { ImpactRatingStatus } from '../../../../impacts/ratings/ratingStatus';
import type { ImpactRatingTableFields } from '../../../../impacts/ratings/types';
import type { RiskRegisterFields } from '../../../../risks/types';
import { useCalculatePlacematRatings } from './useCalculatePlacematRatings';

const otherRiskFields = stub<RiskRegisterFields>({});
const otherImpactRatingFields = stub<ImpactRatingTableFields>({});

describe('useCalculatePlacematRatings', () => {
  const mockRisks: RiskRegisterFields[] = [
    { ...otherRiskFields, Id: 'risk1' },
    { ...otherRiskFields, Id: 'risk2' },
    { ...otherRiskFields, Id: 'risk3' },
  ];

  const mockImpactRatings: ImpactRatingTableFields[] = [
    {
      ...otherImpactRatingFields,
      RatedItemId: 'risk1',
      ImpactId: 'impact1',
      Rating: 5,
      Status: ImpactRatingStatus.Active,
      Likelihood: 5,
      RatedItem: 'Risk 1',
    },
    {
      ...otherImpactRatingFields,
      RatedItemId: 'risk1',
      ImpactId: 'impact2',
      Rating: 3,
      Status: ImpactRatingStatus.Active,
      Likelihood: 5,
      RatedItem: 'Risk 1',
    },
    {
      ...otherImpactRatingFields,
      RatedItemId: 'risk2',
      ImpactId: 'impact1',
      Rating: 4,
      Status: ImpactRatingStatus.Active,
      Likelihood: 1,
      RatedItem: 'Risk 2',
    },
    {
      ...otherImpactRatingFields,
      RatedItemId: 'risk3',
      ImpactId: 'impact1',
      Rating: 2,
      Status: ImpactRatingStatus.Archived,
      Likelihood: 3,
      RatedItem: 'Risk 3',
    },
  ];

  const mockData = stub<GetImpactRatingsWithAppetitesQuery>({
    impact_rating: [
      {
        RatedItemId: 'risk1',
        ratedItem: {
          risk: {
            likelihoodAppetite: [{ appetite: { LikelihoodAppetite: 3 } }],
            impactAppetites: [
              {
                appetite: {
                  ImpactAppetite: 2,
                  ImpactId: 'impact1',
                },
              },
            ],
          },
        },
      },
    ],
  });

  it('should calculate placemat ratings correctly i.e. appetite - rating = placemat rating', () => {
    const { result } = renderHook(() =>
      useCalculatePlacematRatings(mockRisks, mockImpactRatings, mockData)
    );

    expect(result.current).toEqual({
      risk1: {
        riskName: 'Risk 1',
        likelihood: -2,
        ratings: {
          impact1: -3,
          impact2: 0,
        },
      },
      risk2: {
        riskName: 'Risk 2',
        likelihood: 0,
        ratings: {
          impact1: 0,
        },
      },
    });
  });

  it('should calculate ratings correctly when impact appetite is 0', () => {
    const mockImpactRatings: ImpactRatingTableFields[] = [
      {
        ...otherImpactRatingFields,
        RatedItemId: 'risk1',
        ImpactId: 'impact1',
        Rating: 3,
        Status: ImpactRatingStatus.Active,
        Likelihood: 5,
        RatedItem: 'Risk 1',
      },
    ];
    const mockData = stub<GetImpactRatingsWithAppetitesQuery>({
      impact_rating: [
        {
          RatedItemId: 'risk1',
          ratedItem: {
            risk: {
              likelihoodAppetite: [{ appetite: { LikelihoodAppetite: 3 } }],
              impactAppetites: [
                {
                  appetite: {
                    ImpactAppetite: 0,
                    ImpactId: 'impact1',
                  },
                },
              ],
            },
          },
        },
      ],
    });
    const { result } = renderHook(() =>
      useCalculatePlacematRatings(mockRisks, mockImpactRatings, mockData)
    );

    expect(result.current['risk1'].ratings['impact1']).toBe(-3);
  });

  it('should calculate ratings correctly for unexpected values', () => {
    const mockImpactRatings: ImpactRatingTableFields[] = [
      {
        ...otherImpactRatingFields,
        RatedItemId: 'risk1',
        ImpactId: 'impact1',
        Rating: 11,
        Status: ImpactRatingStatus.Active,
        Likelihood: 5,
        RatedItem: 'Risk 1',
      },
      {
        ...otherImpactRatingFields,
        RatedItemId: 'risk1',
        ImpactId: 'impact2',
        Rating: -12,
        Status: ImpactRatingStatus.Active,
        Likelihood: 5,
        RatedItem: 'Risk 1',
      },
    ];
    const mockData = stub<GetImpactRatingsWithAppetitesQuery>({
      impact_rating: [
        {
          RatedItemId: 'risk1',
          ratedItem: {
            risk: {
              likelihoodAppetite: [{ appetite: { LikelihoodAppetite: 3 } }],
              impactAppetites: [
                {
                  appetite: {
                    ImpactAppetite: 1,
                    ImpactId: 'impact1',
                  },
                },
                {
                  appetite: {
                    ImpactAppetite: 2,
                    ImpactId: 'impact2',
                  },
                },
              ],
            },
          },
        },
      ],
    });
    const { result } = renderHook(() =>
      useCalculatePlacematRatings(mockRisks, mockImpactRatings, mockData)
    );

    expect(result.current['risk1'].ratings['impact1']).toBe(-10);
    expect(result.current['risk1'].ratings['impact2']).toBe(14);
  });

  it('should return an empty object if no impact ratings are provided', () => {
    const { result } = renderHook(() =>
      useCalculatePlacematRatings(mockRisks, [], mockData)
    );

    expect(result.current).toEqual({});
  });

  it('should return an empty object if no risks are provided', () => {
    const { result } = renderHook(() =>
      useCalculatePlacematRatings([], mockImpactRatings, mockData)
    );

    expect(result.current).toEqual({});
  });

  it('should handle undefined data gracefully', () => {
    const { result } = renderHook(() =>
      useCalculatePlacematRatings(mockRisks, mockImpactRatings, undefined)
    );

    expect(result.current).toEqual({
      risk1: {
        riskName: 'Risk 1',
        likelihood: 0,
        ratings: {
          impact1: 0,
          impact2: 0,
        },
      },
      risk2: {
        riskName: 'Risk 2',
        likelihood: 0,
        ratings: {
          impact1: 0,
        },
      },
    });
  });

  it('should handle risks with no appetite data', () => {
    const partialData = stub<GetImpactRatingsWithAppetitesQuery>({
      impact_rating: [
        {
          RatedItemId: 'risk1',
          ratedItem: {
            risk: {
              likelihoodAppetite: [],
              impactAppetites: [],
            },
          },
        },
      ],
    });

    const { result } = renderHook(() =>
      useCalculatePlacematRatings(mockRisks, mockImpactRatings, partialData)
    );

    expect(result.current.risk1).toEqual({
      riskName: 'Risk 1',
      likelihood: 0,
      ratings: {
        impact1: 0,
        impact2: 0,
      },
    });
  });

  it('should filter out archived impact ratings', () => {
    const { result } = renderHook(() =>
      useCalculatePlacematRatings(mockRisks, mockImpactRatings, mockData)
    );

    expect(result.current).not.toHaveProperty('risk3');
  });
});
