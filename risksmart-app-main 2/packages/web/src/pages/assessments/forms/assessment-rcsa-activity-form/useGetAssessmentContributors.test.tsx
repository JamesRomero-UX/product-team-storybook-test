import type {
  GetAssessmentByIdQuery,
  GetRiskByIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { renderHook } from '@testing-library/react';

import { useGetAssessmentContributors } from './useGetAssessmentContributors';

const mockAssessmentData = {
  assessment: [
    {
      ancestorContributors: [
        { ContributorType: 'owner', UserId: 'user1' },
        { ContributorType: 'notOwnerOrContributor', UserId: 'user2' },
        { ContributorType: 'contributor', UserId: 'user3' },
      ],
    },
  ],
} as GetAssessmentByIdQuery;

const mockRiskData = {
  risk: [
    {
      ancestorContributors: [{ UserId: 'user1' }, { UserId: 'user4' }],
    },
  ],
} as GetRiskByIdQuery;

describe('useGetAssessmentContributors', () => {
  it('returns all assessment contributors if isUpdate is false or undefined', () => {
    const { result } = renderHook(() =>
      useGetAssessmentContributors(mockAssessmentData, mockRiskData)
    );
    expect(result.current).toEqual(['user1', 'user3']);
  });

  it('returns only contributors who are also in risk contributors when isUpdate is true', () => {
    const { result } = renderHook(() =>
      useGetAssessmentContributors(mockAssessmentData, mockRiskData, true)
    );
    expect(result.current).toEqual(['user1']);
  });

  it('returns empty array if assessmentData is undefined', () => {
    const { result } = renderHook(() =>
      useGetAssessmentContributors(undefined, mockRiskData)
    );
    expect(result.current).toEqual([]);
  });

  it('returns all assessment contributors if risk is undefined and isUpdate is false', () => {
    const { result } = renderHook(() =>
      useGetAssessmentContributors(mockAssessmentData, undefined, false)
    );
    expect(result.current).toEqual(['user1', 'user3']);
  });

  it('returns empty array if risk is undefined and isUpdate is true', () => {
    const { result } = renderHook(() =>
      useGetAssessmentContributors(mockAssessmentData, undefined, true)
    );
    expect(result.current).toEqual([]);
  });

  it('returns empty array if no contributors in assessment', () => {
    const { result } = renderHook(() =>
      useGetAssessmentContributors(
        {
          assessment: [
            {
              ancestorContributors: [
                { ContributorType: 'notOwnerOrContributor', UserId: 'user1' },
              ],
            },
          ],
        } as unknown as GetAssessmentByIdQuery,
        mockRiskData
      )
    );
    expect(result.current).toEqual([]);
  });
});
