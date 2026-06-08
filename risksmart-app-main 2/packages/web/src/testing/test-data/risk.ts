import type { GetRiskByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';

const defaultRisk: GetRiskByIdQuery['risk'][number] = {
  schedule: { Id: 'risk-1', Frequency: null },
  Id: 'risk-1',
  Title: 'Scope Creep',
  Tier: 1,
  Description: 'Risk of scope creep due to changing requirements',
  ParentRiskId: null,
  CreatedByUser: 'auth0|644151efc3a961d2784456d9',
  Treatment: null,
  Status: null,
  ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
  CreatedAtTimestamp: '2024-08-15T07:16:30.147171+00:00',
  ModifiedAtTimestamp: '2024-08-15T07:16:30.147171+00:00',
  CustomAttributeData: null,
  SequentialId: 3,

  __typename: 'risk',
  parent: null,
  parentNode: null,
  assessmentResults: [],
  tags: [],
  departments: [],
  owners: [
    {
      UserId: 'auth0|644151efc3a961d2784456d9',
      user: {
        FriendlyName: 'RiskManager1',
        Id: 'auth0|644151efc3a961d2784456d9',
        __typename: 'user',
      },
      __typename: 'owner',
    },
  ],
  contributors: [],
  ownerGroups: [],
  contributorGroups: [],
  ancestorContributors: [
    {
      ContributorType: 'owner',
      UserId: 'auth0|644151efc3a961d2784456d9',
      Id: 'a1d30192-8100-46b1-a584-6db81b22f935',
      AncestorId: 'a1d30192-8100-46b1-a584-6db81b22f935',
      UserGroupId: null,
      user: {
        FriendlyName: 'RiskManager1',
        __typename: 'user',
      },
      user_group: null,
      __typename: 'ancestor_contributor',
    },
  ],
};

export const buildRisk = (
  overrides: Partial<GetRiskByIdQuery['risk'][number]>
): GetRiskByIdQuery['risk'][number] => {
  return {
    ...defaultRisk,
    ...overrides,
  };
};
