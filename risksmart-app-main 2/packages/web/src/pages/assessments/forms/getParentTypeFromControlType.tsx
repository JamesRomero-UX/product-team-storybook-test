import {
  Parent_Type_Enum,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { AssessmentTypeEnum } from '../types';

export type RiskAssessmentResultFormIds = Extract<
  Parent_Type_Enum,
  | 'controlled_risk_assessment_result'
  | 'uncontrolled_risk_assessment_result'
  | 'risk_controlled_second_line_result'
  | 'risk_uncontrolled_second_line_result'
  | 'risk_controlled_internal_audit_result'
  | 'risk_uncontrolled_internal_audit_result'
>;

export const getParentTypeFromControlType = (
  controlType: Risk_Assessment_Result_Control_Type_Enum,
  assessmentMode?: AssessmentTypeEnum
): RiskAssessmentResultFormIds => {
  switch (assessmentMode) {
    case 'compliance_monitoring_assessment':
      return controlType === Risk_Assessment_Result_Control_Type_Enum.Controlled
        ? Parent_Type_Enum.RiskControlledSecondLineResult
        : Parent_Type_Enum.RiskUncontrolledSecondLineResult;
    case 'internal_audit_report':
      return controlType === Risk_Assessment_Result_Control_Type_Enum.Controlled
        ? Parent_Type_Enum.RiskControlledInternalAuditResult
        : Parent_Type_Enum.RiskUncontrolledInternalAuditResult;
    case 'rating':
    case undefined:
      return controlType === Risk_Assessment_Result_Control_Type_Enum.Controlled
        ? Parent_Type_Enum.ControlledRiskAssessmentResult
        : Parent_Type_Enum.UncontrolledRiskAssessmentResult;
  }
};
