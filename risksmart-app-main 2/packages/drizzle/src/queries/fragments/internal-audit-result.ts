import type { QueryConfig } from '../../db';

export const documentInternalAuditResult = {
  columns: {
    Id: true,
    Rating: true,
    CustomAttributeData: true,
    Rationale: true,
    TestDate: true,
  },
} as const satisfies QueryConfig<'document_internal_audit_result'>;

export const obligationInternalAuditResult = {
  columns: {
    Id: true,
    Rating: true,
    CustomAttributeData: true,
    Rationale: true,
    TestDate: true,
  },
} as const satisfies QueryConfig<'obligation_internal_audit_result'>;

export const riskControlledInternalAuditResultInternalAuditResult = {
  columns: {
    Id: true,
    Rating: true,
    CustomAttributeData: true,
    Rationale: true,
    TestDate: true,
    Likelihood: true,
  },
} as const satisfies QueryConfig<'risk_controlled_internal_audit_result'>;

export const riskUncontrolledInternalAuditResultInternalAuditResult = {
  columns: {
    Id: true,
    Rating: true,
    CustomAttributeData: true,
    Rationale: true,
    TestDate: true,
    Likelihood: true,
  },
} as const satisfies QueryConfig<'risk_uncontrolled_internal_audit_result'>;

export const controlTestInternalAuditResult = {
  columns: {
    Description: true,
    DesignEffectiveness: true,
    Id: true,
    OverallEffectiveness: true,
    ParentControlId: true,
    PerformanceEffectiveness: true,
    Submitter: true,
    TestDate: true,
    TestType: true,
    CreatedAtTimestamp: true,
    ModifiedAtTimestamp: true,
    Title: true,
    CreatedByUser: true,
    ModifiedByUser: true,
    CustomAttributeData: true,
    SequentialId: true,
  },
} as const satisfies QueryConfig<'control_test_internal_audit_result'>;
