import type { QueryConfig } from '../../db';

export const documentAssessmentResult = {
  columns: {
    Id: true,
    Rating: true,
    CustomAttributeData: true,
    Rationale: true,
    TestDate: true,
    CreatedAtTimestamp: true,
  },
} as const satisfies QueryConfig<'document_assessment_result'>;

export const obligationAssessmentResult = {
  columns: {
    Id: true,
    Rating: true,
    CustomAttributeData: true,
    Rationale: true,
    TestDate: true,
    CreatedAtTimestamp: true,
  },
} as const satisfies QueryConfig<'obligation_assessment_result'>;

export const complianceMonitoringAssessment = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'compliance_monitoring_assessment'>;

export const riskAssessmentResult = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'risk_assessment_result'>;

export const riskUncontrolledSecondLineResult = {
  columns: {
    Id: true,
    Likelihood: true,
    Impact: true,
    Rating: true,
    CustomAttributeData: true,
    Rationale: true,
    TestDate: true,
  },
} as const satisfies QueryConfig<'risk_uncontrolled_second_line_result'>;

export const riskControlledSecondLineResult = {
  columns: {
    Id: true,
    Likelihood: true,
    Impact: true,
    Rating: true,
    CustomAttributeData: true,
    Rationale: true,
    TestDate: true,
  },
} as const satisfies QueryConfig<'risk_controlled_second_line_result'>;

export const riskControlledInternalAuditResult = {
  columns: {
    Id: true,
    Likelihood: true,
    Impact: true,
    Rating: true,
    CustomAttributeData: true,
    Rationale: true,
    TestDate: true,
  },
} as const satisfies QueryConfig<'risk_controlled_internal_audit_result'>;

export const riskUncontrolledInternalAuditResult = {
  columns: {
    Id: true,
    Likelihood: true,
    Impact: true,
    Rating: true,
    CustomAttributeData: true,
    Rationale: true,
    TestDate: true,
  },
} as const satisfies QueryConfig<'risk_uncontrolled_internal_audit_result'>;
