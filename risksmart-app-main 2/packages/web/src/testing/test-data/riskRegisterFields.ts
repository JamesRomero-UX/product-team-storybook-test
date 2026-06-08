import type { RiskRegisterFields } from 'src/pages/risks/types';

const defaultRiskRegisterFields: RiskRegisterFields = {
  schedule: {
    Id: 'c938bde6-460c-4b2a-af42-0d0f8c06a011',
  },
  NextTestOverdueDate: null,
  StatusLabelled: 'Monitored',
  TreatmentLabelled: 'Tolerate',
  createdByUser: {
    __typename: 'user',
    FriendlyName: 'RiskManager1',
  },
  parent: {
    __typename: 'risk',
    Title: 'Security Breach',
  },
  parentNode: {
    __typename: 'node',
    Id: 'd1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4',
    ObjectType: 'risk',
    SequentialId: 4,
  },
  owners: [
    {
      __typename: 'owner',
      UserId: 'auth0|644151efc3a961d2784456d9',
      user: {
        __typename: 'user',
        FriendlyName: 'RiskManager1',
        Id: 'auth0|644151efc3a961d2784456d9',
      },
    },
  ],
  ownerGroups: [],
  contributors: [],
  contributorGroups: [],
  appetites: [],
  impactRatings: [],
  impactRatingsForTrend: [],
  assessmentResults: [],
  controls_aggregate: {
    __typename: 'control_parent_aggregate',
    aggregate: {
      __typename: 'control_parent_aggregate_fields',
      count: 0,
    },
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
  tags: [
    {
      __typename: 'tag',
      type: {
        __typename: 'tag_type',
        Description: 'Another example tag',
        Name: 'Tag two',
      },
      ParentId: 'c938bde6-460c-4b2a-af42-0d0f8c06a011',
      TagTypeId: 'b2781d16-4827-4d81-a9ba-9402e0c56f72',
    },
  ],
  departments: [
    {
      __typename: 'department',
      type: {
        __typename: 'department_type',
        Description: 'Another example Dept',
        Name: 'Dept two',
      },
      ParentId: 'c938bde6-460c-4b2a-af42-0d0f8c06a011',
      DepartmentTypeId: 'a2781d16-4827-4d81-a9ba-9402e0c56f72',
    },
  ],
  Id: 'c938bde6-460c-4b2a-af42-0d0f8c06a011',
  Title: 'Data Loss',
  Tier: 3,
  Description: 'Risk of data loss due to hardware failure',
  ParentRiskId: 'd1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4',
  CreatedByUser: 'auth0|644151efc3a961d2784456d9',
  Treatment: null,
  Status: null,
  ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
  CreatedAtTimestamp: '2024-07-23T13:46:52.583775+00:00',
  ModifiedAtTimestamp: '2024-07-23T13:46:52.583775+00:00',
  CustomAttributeData: {},
  SequentialId: 5,
  NextTestDate: '-',
  LatestRatingDate: '-',
  TestFrequency: null,
  TierLabelled: 'Tier 3',
  UncontrolledRatingLabelled: 'Unrated',
  ControlledRatingLabelled: 'Unrated',
  UpperAppetiteLabelled: '',
  LowerAppetiteLabelled: '',
  AppetitePerformance: null,
  AppetitePerformanceLabelled: 'Undefined',
  LinkedControlCount: 0,
  LinkedIndicatorCount: 0,
  ParentTitle: 'Security Breach',
  UncontrolledRating: null,
  ControlledRating: null,
  UncontrolledScore: null,
  ControlledScore: null,
  UserName: 'RiskManager1',
  ControlledLikelihoodValue: null,
  ControlledImpactValue: null,
  UncontrolledImpactValue: null,
  UncontrolledLikelihoodValue: null,
  UncontrolledLikelihood: '',
  ControlledLikelihood: '',
  ControlledImpact: '',
  UncontrolledImpact: '',
  SequentialIdLabel: 'R-5',
  allOwners: [
    {
      label: 'RiskManager1',
      id: 'auth0|644151efc3a961d2784456d9',
    },
  ],
  allContributors: [
    {
      label: 'RiskManager1',
      id: 'auth0|644151efc3a961d2784456d9',
    },
  ],
  ImpactPerformanceScore: 0,
  ControlledRatingHistory: [],
  UncontrolledRatingHistory: [],
  UncontrolledRatingTrend: null,
  UncontrolledRatingTrendLabelled: '-',
  ControlledRatingTrend: null,
  ControlledRatingTrendLabelled: '-',
  EnterpriseRiskLabelled: '',
  Entity: '',
  TestScheduleStatus: null,
  TestScheduleStatusLabelled: '-',
};
export const buildRiskRegisterFields = (
  overrides: Partial<RiskRegisterFields> = {}
): RiskRegisterFields => {
  return {
    ...defaultRiskRegisterFields,
    ...overrides,
  };
};
