import { describe, expect, it } from 'vitest';

import type { Rating } from './ratings';
import { getRatingByLikelihoodAndImpact } from './ratings';

describe('getRatingByLikelihoodAndImpact', () => {
  const mockRatings: Rating[] = [
    {
      label: 'Low',
      value: 1,
      likelihoodImpact: [
        { likelihood: 1, impact: 1 },
        { likelihood: 1, impact: 2 }, // Wonky
      ],
    },
    {
      label: 'Medium',
      value: 2,
      likelihoodImpact: [
        { likelihood: 2, impact: 1 }, // Wonky
        { likelihood: 2, impact: 2 },
        { likelihood: 3, impact: 3 },
      ],
    },
    {
      label: 'High',
      value: 3,
      likelihoodImpact: [
        { likelihood: 4, impact: 4 },
        { likelihood: 5, impact: 5 },
      ],
    },
    {
      label: 'No Impact Data',
      value: 4,
    },
  ];

  it('should return the correct rating for a given likelihood and impact', () => {
    const result = getRatingByLikelihoodAndImpact(mockRatings, 2, 2);
    expect(result).toEqual(mockRatings[1]);
  });

  it('should return the correct rating when multiple likelihood/impact pairs exist for a rating', () => {
    const result = getRatingByLikelihoodAndImpact(mockRatings, 1, 2);
    expect(result).toEqual(mockRatings[0]);
    const result2 = getRatingByLikelihoodAndImpact(mockRatings, 2, 1);
    expect(result2).toEqual(mockRatings[1]);
  });

  it('should return undefined if no matching rating is found', () => {
    const result = getRatingByLikelihoodAndImpact(mockRatings, 1, 3);
    expect(result).toBeUndefined();
  });

  it('should return undefined if likelihood is null', () => {
    const result = getRatingByLikelihoodAndImpact(mockRatings, null, 2);
    expect(result).toBeUndefined();
  });

  it('should return undefined if impact is null', () => {
    const result = getRatingByLikelihoodAndImpact(mockRatings, 2, null);
    expect(result).toBeUndefined();
  });

  it('should return undefined if likelihood is undefined', () => {
    const result = getRatingByLikelihoodAndImpact(mockRatings, undefined, 2);
    expect(result).toBeUndefined();
  });

  it('should return undefined if impact is undefined', () => {
    const result = getRatingByLikelihoodAndImpact(mockRatings, 2, undefined);
    expect(result).toBeUndefined();
  });

  it('should return undefined for an empty options array', () => {
    const result = getRatingByLikelihoodAndImpact([], 2, 2);
    expect(result).toBeUndefined();
  });

  it('should return the first matching rating if multiple ratings match', () => {
    const ratingsWithDuplicate: Rating[] = [
      ...mockRatings,
      {
        label: 'Also Medium',
        value: 5,
        likelihoodImpact: [{ likelihood: 2, impact: 2 }],
      },
    ];
    const result = getRatingByLikelihoodAndImpact(ratingsWithDuplicate, 2, 2);
    expect(result).toEqual(mockRatings[1]); // Should be the first 'Medium' rating
  });
});
