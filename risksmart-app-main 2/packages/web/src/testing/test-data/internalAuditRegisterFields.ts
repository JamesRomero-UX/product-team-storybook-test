import type { InternalAuditRegisterFields } from '../../pages/internal-audit/types';

const defaultInternalAuditRegisterFields: InternalAuditRegisterFields = {
  AuditRating: 1,
  actions: [],
  internalAuditReports: [],
  issues: [],
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
  modifiedByUser: {
    __typename: 'user',
    FriendlyName: 'RiskManager1',
  },
  createdByUser: {
    __typename: 'user',
    FriendlyName: 'RiskManager1',
  },
  tags: [],
  departments: [],
  Id: 'db8b6e81-d2c0-498c-8f81-a81a2cfd7b0d',
  SequentialId: 1,
  Title: 'New IA',
  Description: '',
  CreatedByUser: 'auth0|644151efc3a961d2784456d9',
  ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
  CreatedAtTimestamp: '2024-07-23T14:19:36.72244+00:00',
  ModifiedAtTimestamp: '2024-07-23T14:19:36.72244+00:00',
  CustomAttributeData: null,
  businessArea: {
    __typename: 'business_area',
    Title: 'Tech',
    SequentialId: 1,
    Id: '6ba99882-9091-47f3-859e-d6ec1918bbe6',
  },
  SequentialIdLabel: 'IA-1',
  CreatedBy: 'auth0|644151efc3a961d2784456d9',
  UserName: 'RiskManager1',
  ModifiedBy: 'auth0|644151efc3a961d2784456d9',
  allOwners: [
    {
      label: 'RiskManager1',
      id: 'auth0|644151efc3a961d2784456d9',
    },
  ],
  allContributors: [],
  BusinessArea: 'Tech',
  LatestReportDate: '-',
  AuditRatingLabelled: '-',
  OpenActionCount: 0,
  OpenIssueCount: 0,
  ReportStatus: 'unallocated',
  ReportStatusLabelled: 'Unallocated',
};

export const buildInternalAuditRegisterFields = (
  overrides: Partial<InternalAuditRegisterFields> = {}
): InternalAuditRegisterFields => {
  return {
    ...defaultInternalAuditRegisterFields,
    ...overrides,
  };
};
