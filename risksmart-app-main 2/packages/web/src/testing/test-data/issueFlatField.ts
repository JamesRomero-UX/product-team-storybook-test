import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { IssueFlatField } from '../../pages/issues/types';

export const defaultIssueFlatField: IssueFlatField = {
  SequentialId: 1,
  DateIdentified: '',
  DateOccurred: '',
  Details: '',
  Id: '',
  CreatedAtTimestamp: '',
  ModifiedAtTimestamp: '',
  RaisedAtTimestamp: '',
  Title: '',
  ModifiedByUser: '',
  consequences: [],
  owners: [],
  ownerGroups: [],
  contributors: [],
  contributorGroups: [],
  actions_aggregate: {
    __typename: undefined,
    aggregate: undefined,
  },
  departments: [],
  tags: [],
  Type: 'issue',
  parents: [
    {
      parent: {
        ObjectType: Parent_Type_Enum.Control,
        Id: '22fe4307-5c36-4c22-b935-46bda23dae4f',
      },
      control: {
        Title: 'Parent control title',
      },
    },
  ],
  issueUpdateSummary: {
    Count: 4,
    LatestDescription: 'Update description',
    LatestTitle: 'Update title',
    LatestCreatedAtTimestamp: '2025-05-27',
  },
  assessment: {
    ActualCloseDate: '',
    CertifiedIndividual: null,
    IssueCausedBySystemIssue: null,
    IssueCausedByThirdParty: null,
    IssueType: null,
    ParentIssueId: '',
    PoliciesBreached: null,
    PolicyBreach: null,
    PolicyOwner: null,
    PolicyOwnerCommentary: null,
    Rationale: null,
    RegulatoryBreach: null,
    RegulationsBreached: null,
    Reportable: null,
    Severity: null,
    Status: null,
    SystemResponsible: null,
    TargetCloseDate: null,
    ThirdPartyResponsible: null,
    CreatedAtTimestamp: '',
    ModifiedAtTimestamp: '',
    CreatedByUser: null,
    ModifiedByUser: '',
    Id: '',
    CustomAttributeData: null,
    modifiedByUser: { __typename: 'user', FriendlyName: null },
    createdByUser: { __typename: 'user', FriendlyName: null },
    certifiedIndividual: { __typename: 'user', FriendlyName: null },
    departments: [],
    Type: 'issue_assessment',
  },
};

export const buildIssueFlatField = (
  overrides: Partial<IssueFlatField> = {}
): IssueFlatField => {
  return {
    ...defaultIssueFlatField,
    ...overrides,
  };
};
