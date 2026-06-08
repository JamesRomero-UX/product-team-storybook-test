const defaultIssueAssessmentRequestedChanges = {
  ActualCloseDate: '2023-05-14T22:41:58.03502+00:00',
  CertifiedIndividual: 'auth0|644151efc3a961d2784456d9',
  IssueCausedBySystemIssue: false,
  IssueCausedByThirdParty: false,
  IssueType: 'near-miss',
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
  parents: [
    {
      IssueId: '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90',
      ParentId: 'f1d30192-8100-46b1-a584-6db81b22f935',
      ParentType: 'control',
    },
  ],
  departments: [],
  tags: [],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const buildIssueAssessmentRequestedChanges = (overrides: any = {}) => {
  return {
    ...defaultIssueAssessmentRequestedChanges,
    ...overrides,
  };
};
