import type {
  GetAssessmentByIdQuery,
  GetRiskByIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { renderHook } from '@testing-library/react';

import { useGetAssessmentContributorGroups } from './useGetAssessmentContributorGroups';

const mockAssessmentData = {
  assessment: [
    {
      ancestorContributors: [
        {
          ContributorType: 'owner',
          UserGroupId: 'group1',
          user_group: { id: 'group1' },
        },
        {
          ContributorType: 'notOwnerOrContributor',
          UserGroupId: 'group2',
          user_group: { id: 'group2' },
        },
        {
          ContributorType: 'contributor',
          UserGroupId: 'group3',
          user_group: { id: 'group3' },
        },
        { ContributorType: 'owner', UserGroupId: 'group4', user_group: null },
      ],
    },
  ],
} as GetAssessmentByIdQuery;

const mockRiskData = {
  risk: [
    {
      ancestorContributors: [
        { UserGroupId: 'group1' },
        { UserGroupId: 'group5' },
      ],
    },
  ],
} as GetRiskByIdQuery;

describe('useGetAssessmentContributorGroups', () => {
  it('returns all contributor group IDs with user_group if isUpdate is false or undefined', () => {
    const { result } = renderHook(() =>
      useGetAssessmentContributorGroups(mockAssessmentData, mockRiskData)
    );
    expect(result.current).toEqual(['group1', 'group3']);
  });

  it('returns only contributor group IDs that are also in risk contributors when isUpdate is true', () => {
    const { result } = renderHook(() =>
      useGetAssessmentContributorGroups(mockAssessmentData, mockRiskData, true)
    );
    expect(result.current).toEqual(['group1']);
  });

  it('returns empty array if assessmentData is undefined', () => {
    const { result } = renderHook(() =>
      useGetAssessmentContributorGroups(undefined, mockRiskData)
    );
    expect(result.current).toEqual([]);
  });

  it('returns all contributor group IDs with user_group if risk is undefined and isUpdate is false', () => {
    const { result } = renderHook(() =>
      useGetAssessmentContributorGroups(mockAssessmentData, undefined, false)
    );
    expect(result.current).toEqual(['group1', 'group3']);
  });

  it('returns empty array if risk is undefined and isUpdate is true', () => {
    const { result } = renderHook(() =>
      useGetAssessmentContributorGroups(mockAssessmentData, undefined, true)
    );
    expect(result.current).toEqual([]);
  });

  it('ignores contributors without a user_group', () => {
    const mockAssessmentWithNoUserGroup = {
      assessment: [
        {
          ancestorContributors: [
            {
              ContributorType: 'owner',
              UserGroupId: 'groupX',
              user_group: null,
            },
          ],
        },
      ],
    } as GetAssessmentByIdQuery;

    const { result } = renderHook(() =>
      useGetAssessmentContributorGroups(
        mockAssessmentWithNoUserGroup,
        mockRiskData
      )
    );
    expect(result.current).toEqual([]);
  });

  it('returns empty array if no contributor groups exist', () => {
    const mockAssessmentWithNoOwner = {
      assessment: [
        {
          ancestorContributors: [
            {
              ContributorType: 'notOwner',
              UserGroupId: 'group1',
              user_group: { id: 'group1' },
            },
          ],
        },
      ],
    } as unknown as GetAssessmentByIdQuery;

    const { result } = renderHook(() =>
      useGetAssessmentContributorGroups(mockAssessmentWithNoOwner, mockRiskData)
    );
    expect(result.current).toEqual([]);
  });
});
