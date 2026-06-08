import type { RiskFields } from '../../pages/risks/types';

const defaultRisk: RiskFields = {
  schedule: {
    Id: '1b008049-bb67-44c0-9237-8c3c6989ba38',
    Frequency: null,
  },
  Id: '1b008049-bb67-44c0-9237-8c3c6989ba38',
  Title: 'Data',
  Tier: 2,
  Description:
    'Data risk is the potential for a loss related to your data. The term applies to failures in the storage, use, transmission, management and security of data.',
  ParentRiskId: 'b2781d16-4827-4d81-a9ba-9402e0c56f7f',
  CreatedByUser: 'auth0|644152102c766a09dd585d2e',
  Treatment: null,
  Status: null,
  ModifiedByUser: 'auth0|644152102c766a09dd585d2e',
  CreatedAtTimestamp: '2024-07-01T14:02:39.42653+00:00',
  ModifiedAtTimestamp: '2024-07-01T14:02:39.42653+00:00',
  CustomAttributeData: null,
  SequentialId: 6,

  createdByUser: {
    FriendlyName: 'Standard1',
    __typename: 'user',
  },
  parent: {
    Title: 'Project Delays',
    __typename: 'risk',
  },
  owners: [],
  ownerGroups: [],
  contributors: [],
  contributorGroups: [],
  appetites: [],
  impactRatings: [],
  impactRatingsForTrend: [],
  assessmentResults: [],
  controls_aggregate: {
    aggregate: {
      count: 0,
      __typename: 'control_parent_aggregate_fields',
    },
    __typename: 'control_parent_aggregate',
  },
  indicators_aggregate: {
    aggregate: {
      count: 0,
    },
  },
  actions_aggregate: {
    aggregate: {
      count: 0,
    },
  },
  tags: [],
  departments: [],
};

export const buildRisk = (overrides: Partial<RiskFields> = {}) => ({
  ...defaultRisk,
  ...overrides,
});
