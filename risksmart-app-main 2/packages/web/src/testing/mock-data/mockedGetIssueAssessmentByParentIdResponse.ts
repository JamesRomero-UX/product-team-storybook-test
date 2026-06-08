import type { MockedResponse } from '@apollo/client/testing';
import {
  GetIssueAssessmentByParentIdDocument,
  type GetIssueAssessmentByParentIdQuery,
  type GetIssueAssessmentByParentIdQueryVariables,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetIssueAssessmentByIdResponse = (
  variables: GetIssueAssessmentByParentIdQueryVariables,
  response: GetIssueAssessmentByParentIdQuery = {
    issue: [],
    issue_assessment: [
      {
        ActualCloseDate: '2023-05-14T22:41:58.03502+00:00',
        CertifiedIndividual: 'auth0|644151efc3a961d2784456d9',
        IssueCausedBySystemIssue: false,
        IssueCausedByThirdParty: false,
        IssueType: 'near-miss',
        ParentIssueId: '146eea61-5ddf-4ac6-b6f7-8981afa168a8',
        PoliciesBreached: 'Policies breached',
        PolicyBreach: false,
        PolicyOwner: 'auth0|644151efc3a961d2784456d9',
        PolicyOwnerCommentary: 'Policy owner commentary',
        Rationale: 'true',
        RegulatoryBreach: false,
        RegulationsBreached: null,
        Reportable: false,
        Severity: 3,
        Status: 'open',
        SystemResponsible: 'System responsible',
        TargetCloseDate: '2023-04-24T22:41:58.03502+00:00',
        ThirdPartyResponsible: 'Third party responsible',
        CreatedAtTimestamp: '2025-07-24T14:57:04.911741+00:00',
        ModifiedAtTimestamp: '2025-07-24T14:57:04.911741+00:00',
        CreatedByUser: 'auth0|644151efc3a961d2784456d9',
        ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
        Id: 'a803ea8d-fa58-4757-b6c8-d5e40855251c',
        CustomAttributeData: null,
        Type: 'issue_assessment',
        __typename: 'issue_assessment',
        policyOwner: {
          FriendlyName: 'RiskManager1',
          __typename: 'user',
        },
        certifiedIndividual: {
          FriendlyName: 'RiskManager1',
          __typename: 'user',
        },
        departments: [],
      },
    ],
    issue_parent: [
      {
        parent: {
          ObjectType: Parent_Type_Enum.Control,
        },
        ParentId: 'f1d30192-8100-46b1-a584-6db81b22f935',
        IssueId: '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90',
      },
      {
        parent: {
          ObjectType: Parent_Type_Enum.Obligation,
        },
        ParentId: '68873565-c665-4e4d-b086-763c59da1e68',
        IssueId: '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90',
      },
      {
        parent: {
          ObjectType: Parent_Type_Enum.Document,
        },
        ParentId: '0d3a9abc-dd17-4036-ab52-47d13db75128',
        IssueId: '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90',
      },
    ],
  }
): MockedResponse<
  GetIssueAssessmentByParentIdQuery,
  GetIssueAssessmentByParentIdQueryVariables
> => ({
  request: {
    query: GetIssueAssessmentByParentIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
