import { describe, expect, it } from 'vitest';

import {
  createIssueAssessmentRequestSchema,
  updateIssueAssessmentRequestSchema,
} from './issue-assessment-mutate-request.schema';

const validRequest = {
  issueType: 'compliance-finding',
  severity: 3,
  targetCloseDate: '2025-06-01T00:00:00Z',
  status: 'open',
  rationale: 'Control failure identified during quarterly review',
  regulatoryBreach: false,
  issueCausedByThirdParty: false,
  issueCausedBySystemIssue: false,
  policyBreach: false,
} as const;

const crossFieldRules = [
  {
    flag: 'regulatoryBreach',
    dependent: 'regulationsBreached',
    dependentValue: 'GDPR Article 5',
    expectedMessage:
      'regulationsBreached is only allowed when regulatoryBreach is true',
  },
  {
    flag: 'issueCausedByThirdParty',
    dependent: 'thirdPartyResponsible',
    dependentValue: 'Acme Vendor Ltd',
    expectedMessage:
      'thirdPartyResponsible is only allowed when issueCausedByThirdParty is true',
  },
  {
    flag: 'issueCausedBySystemIssue',
    dependent: 'systemResponsible',
    dependentValue: 'Payment Processing System',
    expectedMessage:
      'systemResponsible is only allowed when issueCausedBySystemIssue is true',
  },
  {
    flag: 'policyBreach',
    dependent: 'policiesBreached',
    dependentValue: 'Data Retention Policy v2.1',
    expectedMessage:
      'policiesBreached is only allowed when policyBreach is true',
  },
] as const;

describe('createIssueAssessmentRequestSchema', () => {
  describe('valid inputs', () => {
    it('should accept a minimal request with only the required status field', () => {
      const result = createIssueAssessmentRequestSchema.safeParse({
        status: 'open',
      });
      expect(result.success).toBe(true);
    });

    it('should accept a valid request with all fields', () => {
      const result = createIssueAssessmentRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should accept null for optional fields', () => {
      const result = createIssueAssessmentRequestSchema.safeParse({
        status: 'open',
        issueType: null,
        severity: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('cross-field validation', () => {
    it.each(crossFieldRules)(
      'should accept $dependent when $flag is true',
      ({ flag, dependent, dependentValue }) => {
        const result = createIssueAssessmentRequestSchema.safeParse({
          ...validRequest,
          [flag]: true,
          [dependent]: dependentValue,
        });
        expect(result.success).toBe(true);
      }
    );

    it.each(crossFieldRules)(
      'should reject $dependent when $flag is false',
      ({ flag, dependent, dependentValue, expectedMessage }) => {
        const result = createIssueAssessmentRequestSchema.safeParse({
          ...validRequest,
          [flag]: false,
          [dependent]: dependentValue,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toHaveLength(1);
          const issue = result.error.issues[0]!;
          expect(issue.path).toEqual([dependent]);
          expect(issue.message).toBe(expectedMessage);
        }
      }
    );

    it.each(crossFieldRules)(
      'should reject $dependent when $flag is null',
      ({ dependent, dependentValue }) => {
        const result = createIssueAssessmentRequestSchema.safeParse({
          status: 'open',
          [dependent]: dependentValue,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
          const issue = result.error.issues[0]!;
          expect(issue.path).toEqual([dependent]);
        }
      }
    );

    it.each(crossFieldRules)(
      'should accept $flag set to true without $dependent',
      ({ flag }) => {
        const result = createIssueAssessmentRequestSchema.safeParse({
          status: 'open',
          [flag]: true,
        });
        expect(result.success).toBe(true);
      }
    );

    it('should report all four violations when every dependent field has an inactive flag', () => {
      const input = crossFieldRules.reduce(
        (acc, { flag, dependent, dependentValue }) => ({
          ...acc,
          [flag]: false,
          [dependent]: dependentValue,
        }),
        { status: 'open' }
      );
      const result = createIssueAssessmentRequestSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(4);
        const paths = result.error.issues.map((i) => i.path[0]);
        crossFieldRules.forEach(({ dependent }) =>
          expect(paths).toContain(dependent)
        );
      }
    });
  });

  describe('field-level validation', () => {
    it.each([0, 6])(
      'should reject severity %i (out of 1–5 range)',
      (severity) => {
        const result = createIssueAssessmentRequestSchema.safeParse({
          severity,
        });
        expect(result.success).toBe(false);
      }
    );

    it.each([1, 5])(
      'should accept severity at boundary value %i',
      (severity) => {
        const result = createIssueAssessmentRequestSchema.safeParse({
          status: 'open',
          severity,
        });
        expect(result.success).toBe(true);
      }
    );

    it('should reject non-integer severity', () => {
      const result = createIssueAssessmentRequestSchema.safeParse({
        severity: 2.5,
      });
      expect(result.success).toBe(false);
    });

    it('should reject an invalid issueType value', () => {
      const result = createIssueAssessmentRequestSchema.safeParse({
        issueType: 'unknown-type',
      });
      expect(result.success).toBe(false);
    });

    it('should reject an invalid status value', () => {
      const result = createIssueAssessmentRequestSchema.safeParse({
        status: 'invalid-status',
      });
      expect(result.success).toBe(false);
    });

    it.each([
      { field: 'targetCloseDate', value: 'not-a-date' },
      { field: 'actualCloseDate', value: '2025-13-01' },
    ])(
      'should reject invalid datetime format for $field',
      ({ field, value }) => {
        const result = createIssueAssessmentRequestSchema.safeParse({
          [field]: value,
        });
        expect(result.success).toBe(false);
      }
    );

    it('should accept datetime with UTC offset', () => {
      const result = createIssueAssessmentRequestSchema.safeParse({
        status: 'open',
        targetCloseDate: '2025-06-01T10:00:00+05:00',
        actualCloseDate: '2025-07-01T10:00:00-03:00',
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('updateIssueAssessmentRequestSchema', () => {
  it('should accept a minimal request with only the required status field', () => {
    const result = updateIssueAssessmentRequestSchema.safeParse({
      status: 'open',
    });
    expect(result.success).toBe(true);
  });

  it('should accept a valid request with all fields', () => {
    const result = updateIssueAssessmentRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should accept all dependent fields when their flags are true', () => {
    const input = crossFieldRules.reduce(
      (acc, { flag, dependent, dependentValue }) => ({
        ...acc,
        [flag]: true,
        [dependent]: dependentValue,
      }),
      { status: 'open' }
    );
    const result = updateIssueAssessmentRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it.each(crossFieldRules)(
    'should reject $dependent when $flag is false',
    ({ flag, dependent, dependentValue }) => {
      const result = updateIssueAssessmentRequestSchema.safeParse({
        status: 'open',
        [flag]: false,
        [dependent]: dependentValue,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        const issue = result.error.issues[0]!;
        expect(issue.path).toEqual([dependent]);
      }
    }
  );
});
