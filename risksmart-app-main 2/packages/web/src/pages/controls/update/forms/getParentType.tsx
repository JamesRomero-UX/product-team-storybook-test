import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { AssessmentTypeEnum } from '../../../assessments/types';

export type TestResultFieldIds = Extract<
  Parent_Type_Enum,
  | 'test_result'
  | 'control_test_internal_audit_result'
  | 'control_test_second_line_result'
>;

export const getParentType = (
  assessmentMode?: AssessmentTypeEnum
): TestResultFieldIds => {
  switch (assessmentMode) {
    case 'internal_audit_report':
      return Parent_Type_Enum.ControlTestInternalAuditResult;
    case 'compliance_monitoring_assessment':
      return Parent_Type_Enum.ControlTestSecondLineResult;
    case 'rating':
    default:
      return Parent_Type_Enum.TestResult;
  }
};
