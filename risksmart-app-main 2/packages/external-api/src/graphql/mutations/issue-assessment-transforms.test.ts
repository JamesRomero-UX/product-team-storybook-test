import { describe, expect, it } from 'vitest';

import { IssueAssessmentStatusEnum } from '../../generated/graphql';
import type {
  CreateIssueAssessmentRequest,
  UpdateIssueAssessmentRequest,
} from '../../schemas/issues/issue-assessment-mutate-request.schema';
import {
  toGraphqlCreateIssueAssessmentInput,
  toGraphqlUpdateIssueAssessmentInput,
} from './issue-assessment-transforms';

const baseRequest: CreateIssueAssessmentRequest = {
  issueType: 'near-miss',
  severity: 3,
  targetCloseDate: '2024-06-01T00:00:00Z',
  actualCloseDate: '2024-05-15T00:00:00Z',
  status: 'open',
  certifiedIndividual: 'provider|user-1',
  regulatoryBreach: true,
  regulationsBreached: 'GDPR Article 5',
  reportable: true,
  rationale: 'Test rationale',
  issueCausedByThirdParty: true,
  thirdPartyResponsible: 'Vendor ABC',
  issueCausedBySystemIssue: true,
  systemResponsible: 'System XYZ',
  policyBreach: true,
  policiesBreached: 'Policy 1',
  policyOwner: 'provider|user-2',
  policyOwnerCommentary: 'Owner commentary',
};

const parentIssueId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const assessmentId = 'aabbccdd-0000-1111-2222-333344445555';
const originalTimestamp = '2024-01-01T00:00:00Z';

describe('toGraphqlCreateIssueAssessmentInput', () => {
  it('should map all fields correctly', () => {
    const result = toGraphqlCreateIssueAssessmentInput(
      baseRequest,
      parentIssueId
    );

    expect(result).toEqual({
      ParentIssueId: parentIssueId,
      IssueType: 'near-miss',
      Severity: 3,
      TargetCloseDate: '2024-06-01T00:00:00Z',
      ActualCloseDate: '2024-05-15T00:00:00Z',
      Status: IssueAssessmentStatusEnum.Open,
      CertifiedIndividual: 'provider|user-1',
      RegulatoryBreach: true,
      RegulationsBreached: 'GDPR Article 5',
      Reportable: true,
      Rationale: 'Test rationale',
      IssueCausedByThirdParty: true,
      ThirdPartyResponsible: 'Vendor ABC',
      IssueCausedBySystemIssue: true,
      SystemResponsible: 'System XYZ',
      PolicyBreach: true,
      PoliciesBreached: 'Policy 1',
      PolicyOwner: 'provider|user-2',
      PolicyOwnerCommentary: 'Owner commentary',
      TagTypeIds: [],
      DepartmentTypeIds: [],
      RegulationsBreachedIds: [],
      AssociatedControlIds: [],
      PoliciesBreachedIds: [],
      CustomAttributeData: null,
    });
  });

  it('should set nullish fields to null when undefined', () => {
    const result = toGraphqlCreateIssueAssessmentInput(
      { status: 'open', regulatoryBreach: undefined },
      parentIssueId
    );

    expect(result.IssueType).toBeNull();
    expect(result.Severity).toBeNull();
    expect(result.TargetCloseDate).toBeNull();
    expect(result.ActualCloseDate).toBeNull();
    expect(result.CertifiedIndividual).toBeNull();
    expect(result.RegulatoryBreach).toBeNull();
    expect(result.RegulationsBreached).toBeNull();
    expect(result.Reportable).toBeNull();
    expect(result.Rationale).toBeNull();
    expect(result.IssueCausedByThirdParty).toBeNull();
    expect(result.ThirdPartyResponsible).toBeNull();
    expect(result.IssueCausedBySystemIssue).toBeNull();
    expect(result.SystemResponsible).toBeNull();
    expect(result.PolicyBreach).toBeNull();
    expect(result.PoliciesBreached).toBeNull();
    expect(result.PolicyOwner).toBeNull();
    expect(result.PolicyOwnerCommentary).toBeNull();
  });

  it('should set empty arrays for TagTypeIds, DepartmentTypeIds, RegulationsBreachedIds, AssociatedControlIds, PoliciesBreachedIds', () => {
    const result = toGraphqlCreateIssueAssessmentInput(
      { status: 'open' },
      parentIssueId
    );

    expect(result.TagTypeIds).toEqual([]);
    expect(result.DepartmentTypeIds).toEqual([]);
    expect(result.RegulationsBreachedIds).toEqual([]);
    expect(result.AssociatedControlIds).toEqual([]);
    expect(result.PoliciesBreachedIds).toEqual([]);
  });

  it('should set CustomAttributeData to null', () => {
    const result = toGraphqlCreateIssueAssessmentInput(
      { status: 'open' },
      parentIssueId
    );

    expect(result.CustomAttributeData).toBeNull();
  });

  it('should cast status to IssueAssessmentStatusEnum', () => {
    const statuses: Array<{
      input: CreateIssueAssessmentRequest['status'];
      expected: IssueAssessmentStatusEnum;
    }> = [
      { input: 'open', expected: IssueAssessmentStatusEnum.Open },
      { input: 'closed', expected: IssueAssessmentStatusEnum.Closed },
      { input: 'declined', expected: IssueAssessmentStatusEnum.Declined },
      { input: 'pending', expected: IssueAssessmentStatusEnum.Pending },
    ];

    for (const { input, expected } of statuses) {
      const result = toGraphqlCreateIssueAssessmentInput(
        { status: input },
        parentIssueId
      );
      expect(result.Status).toBe(expected);
    }
  });

  it('should include ParentIssueId', () => {
    const result = toGraphqlCreateIssueAssessmentInput(
      { status: 'open' },
      parentIssueId
    );

    expect(result.ParentIssueId).toBe(parentIssueId);
  });
});

describe('toGraphqlUpdateIssueAssessmentInput', () => {
  it('should map all fields correctly', () => {
    const updateRequest: UpdateIssueAssessmentRequest = { ...baseRequest };
    const result = toGraphqlUpdateIssueAssessmentInput(
      updateRequest,
      assessmentId,
      originalTimestamp
    );

    expect(result).toEqual({
      Id: assessmentId,
      OriginalTimestamp: originalTimestamp,
      IssueType: 'near-miss',
      Severity: 3,
      TargetCloseDate: '2024-06-01T00:00:00Z',
      ActualCloseDate: '2024-05-15T00:00:00Z',
      Status: IssueAssessmentStatusEnum.Open,
      CertifiedIndividual: 'provider|user-1',
      RegulatoryBreach: true,
      RegulationsBreached: 'GDPR Article 5',
      Reportable: true,
      Rationale: 'Test rationale',
      IssueCausedByThirdParty: true,
      ThirdPartyResponsible: 'Vendor ABC',
      IssueCausedBySystemIssue: true,
      SystemResponsible: 'System XYZ',
      PolicyBreach: true,
      PoliciesBreached: 'Policy 1',
      PolicyOwner: 'provider|user-2',
      PolicyOwnerCommentary: 'Owner commentary',
      TagTypeIds: [],
      DepartmentTypeIds: [],
      RegulationsBreachedIds: [],
      AssociatedControlIds: [],
      PoliciesBreachedIds: [],
      CustomAttributeData: null,
    });
  });

  it('should include Id and OriginalTimestamp', () => {
    const result = toGraphqlUpdateIssueAssessmentInput(
      { status: 'open' },
      assessmentId,
      originalTimestamp
    );

    expect(result.Id).toBe(assessmentId);
    expect(result.OriginalTimestamp).toBe(originalTimestamp);
  });

  it('should set nullish fields to null when undefined', () => {
    const result = toGraphqlUpdateIssueAssessmentInput(
      { status: 'open' },
      assessmentId,
      originalTimestamp
    );

    expect(result.IssueType).toBeNull();
    expect(result.Severity).toBeNull();
    expect(result.CertifiedIndividual).toBeNull();
    expect(result.RegulatoryBreach).toBeNull();
  });

  it('should set empty arrays for collection fields', () => {
    const result = toGraphqlUpdateIssueAssessmentInput(
      { status: 'open' },
      assessmentId,
      originalTimestamp
    );

    expect(result.TagTypeIds).toEqual([]);
    expect(result.DepartmentTypeIds).toEqual([]);
    expect(result.RegulationsBreachedIds).toEqual([]);
    expect(result.AssociatedControlIds).toEqual([]);
    expect(result.PoliciesBreachedIds).toEqual([]);
  });

  it('should preserve existing DepartmentTypeIds when existingDepartmentTypeIds is provided', () => {
    const result = toGraphqlUpdateIssueAssessmentInput(
      { status: 'open' },
      assessmentId,
      originalTimestamp,
      ['dept-1', 'dept-2']
    );

    expect(result.DepartmentTypeIds).toEqual(['dept-1', 'dept-2']);
  });

  it('should always use empty array for TagTypeIds even when existing data provided', () => {
    const result = toGraphqlUpdateIssueAssessmentInput(
      { status: 'open' },
      assessmentId,
      originalTimestamp,
      ['dept-1']
    );

    expect(result.TagTypeIds).toEqual([]);
  });
});
