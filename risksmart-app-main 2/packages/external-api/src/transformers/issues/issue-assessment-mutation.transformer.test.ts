import { describe, expect, it } from 'vitest';

import type { UpdateIssueAssessmentRequest } from '../../schemas/issues/issue-assessment-mutate-request.schema';
import {
  type IssueAssessmentUpdateDefaults,
  mergeIssueAssessmentUpdateDefaults,
} from './issue-assessment-mutation.transformer';

const baseItem: UpdateIssueAssessmentRequest = { status: 'open' };

const existingDefaults: IssueAssessmentUpdateDefaults = {
  IssueType: 'compliance-finding',
  Severity: 3,
  TargetCloseDate: '2024-06-01T00:00:00Z',
  ActualCloseDate: '2024-05-15T00:00:00Z',
  CertifiedIndividual: 'provider|user-123',
  RegulatoryBreach: true,
  RegulationsBreached: 'GDPR Article 5',
  Reportable: false,
  Rationale: 'Existing rationale',
  IssueCausedByThirdParty: true,
  ThirdPartyResponsible: 'Acme Vendor Ltd',
  IssueCausedBySystemIssue: false,
  SystemResponsible: null,
  PolicyBreach: true,
  PoliciesBreached: 'Data Retention Policy',
  PolicyOwner: 'provider|user-456',
  PolicyOwnerCommentary: 'Remediation in progress',
};

describe('mergeIssueAssessmentUpdateDefaults', () => {
  describe('issueType', () => {
    it('preserves existing value when field is omitted (undefined)', () => {
      const result = mergeIssueAssessmentUpdateDefaults(
        baseItem,
        existingDefaults
      );
      expect(result.issueType).toBe('compliance-finding');
    });

    it('passes through explicit null (intentional clear)', () => {
      const item: UpdateIssueAssessmentRequest = {
        ...baseItem,
        issueType: null,
      };
      const result = mergeIssueAssessmentUpdateDefaults(item, existingDefaults);
      expect(result.issueType).toBeNull();
    });

    it('uses provided value when set', () => {
      const item: UpdateIssueAssessmentRequest = {
        ...baseItem,
        issueType: 'near-miss',
      };
      const result = mergeIssueAssessmentUpdateDefaults(item, existingDefaults);
      expect(result.issueType).toBe('near-miss');
    });
  });

  describe('severity', () => {
    it('preserves existing value when field is omitted (undefined)', () => {
      const result = mergeIssueAssessmentUpdateDefaults(
        baseItem,
        existingDefaults
      );
      expect(result.severity).toBe(3);
    });

    it('passes through explicit null (intentional clear)', () => {
      const item: UpdateIssueAssessmentRequest = {
        ...baseItem,
        severity: null,
      };
      const result = mergeIssueAssessmentUpdateDefaults(item, existingDefaults);
      expect(result.severity).toBeNull();
    });

    it('uses provided value when set', () => {
      const item: UpdateIssueAssessmentRequest = { ...baseItem, severity: 5 };
      const result = mergeIssueAssessmentUpdateDefaults(item, existingDefaults);
      expect(result.severity).toBe(5);
    });
  });

  describe('certifiedIndividual', () => {
    it('preserves existing value when field is omitted (undefined)', () => {
      const result = mergeIssueAssessmentUpdateDefaults(
        baseItem,
        existingDefaults
      );
      expect(result.certifiedIndividual).toBe('provider|user-123');
    });

    it('passes through explicit null (intentional clear)', () => {
      const item: UpdateIssueAssessmentRequest = {
        ...baseItem,
        certifiedIndividual: null,
      };
      const result = mergeIssueAssessmentUpdateDefaults(item, existingDefaults);
      expect(result.certifiedIndividual).toBeNull();
    });

    it('uses provided value when set', () => {
      const item: UpdateIssueAssessmentRequest = {
        ...baseItem,
        certifiedIndividual: 'provider|user-789',
      };
      const result = mergeIssueAssessmentUpdateDefaults(item, existingDefaults);
      expect(result.certifiedIndividual).toBe('provider|user-789');
    });
  });

  describe('policyOwner', () => {
    it('preserves existing value when field is omitted (undefined)', () => {
      const result = mergeIssueAssessmentUpdateDefaults(
        baseItem,
        existingDefaults
      );
      expect(result.policyOwner).toBe('provider|user-456');
    });

    it('passes through explicit null (intentional clear)', () => {
      const item: UpdateIssueAssessmentRequest = {
        ...baseItem,
        policyOwner: null,
      };
      const result = mergeIssueAssessmentUpdateDefaults(item, existingDefaults);
      expect(result.policyOwner).toBeNull();
    });

    it('uses provided value when set', () => {
      const item: UpdateIssueAssessmentRequest = {
        ...baseItem,
        policyOwner: 'provider|user-999',
      };
      const result = mergeIssueAssessmentUpdateDefaults(item, existingDefaults);
      expect(result.policyOwner).toBe('provider|user-999');
    });
  });

  describe('boolean fields', () => {
    it.each([
      ['regulatoryBreach', 'RegulatoryBreach', true] as const,
      ['reportable', 'Reportable', false] as const,
      ['issueCausedByThirdParty', 'IssueCausedByThirdParty', true] as const,
      ['issueCausedBySystemIssue', 'IssueCausedBySystemIssue', false] as const,
      ['policyBreach', 'PolicyBreach', true] as const,
    ])(
      '%s - preserves existing when omitted',
      (apiField, _dbField, expected) => {
        const result = mergeIssueAssessmentUpdateDefaults(
          baseItem,
          existingDefaults
        );
        expect(result[apiField]).toBe(expected);
      }
    );
  });

  describe('string fields', () => {
    it.each([
      ['targetCloseDate', 'TargetCloseDate', '2024-06-01T00:00:00Z'] as const,
      ['actualCloseDate', 'ActualCloseDate', '2024-05-15T00:00:00Z'] as const,
      ['regulationsBreached', 'RegulationsBreached', 'GDPR Article 5'] as const,
      ['rationale', 'Rationale', 'Existing rationale'] as const,
      [
        'thirdPartyResponsible',
        'ThirdPartyResponsible',
        'Acme Vendor Ltd',
      ] as const,
      [
        'policiesBreached',
        'PoliciesBreached',
        'Data Retention Policy',
      ] as const,
      [
        'policyOwnerCommentary',
        'PolicyOwnerCommentary',
        'Remediation in progress',
      ] as const,
    ])(
      '%s - preserves existing when omitted',
      (apiField, _dbField, expected) => {
        const result = mergeIssueAssessmentUpdateDefaults(
          baseItem,
          existingDefaults
        );
        expect(result[apiField]).toBe(expected);
      }
    );
  });

  it('uses null existing values when item fields are omitted', () => {
    const existingWithNulls: IssueAssessmentUpdateDefaults = {
      IssueType: null,
      Severity: null,
      TargetCloseDate: null,
      ActualCloseDate: null,
      CertifiedIndividual: null,
      RegulatoryBreach: null,
      RegulationsBreached: null,
      Reportable: null,
      Rationale: null,
      IssueCausedByThirdParty: null,
      ThirdPartyResponsible: null,
      IssueCausedBySystemIssue: null,
      SystemResponsible: null,
      PolicyBreach: null,
      PoliciesBreached: null,
      PolicyOwner: null,
      PolicyOwnerCommentary: null,
    };
    const result = mergeIssueAssessmentUpdateDefaults(
      baseItem,
      existingWithNulls
    );
    expect(result.issueType).toBeNull();
    expect(result.severity).toBeNull();
    expect(result.certifiedIndividual).toBeNull();
    expect(result.policyOwner).toBeNull();
  });
});
