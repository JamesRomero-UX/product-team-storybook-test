import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { AssessmentTypeEnum } from '../types';

export type DocumentAssessmentResultFormIds = Extract<
  Parent_Type_Enum,
  | 'document_assessment_result'
  | 'document_internal_audit_result'
  | 'document_second_line_result'
>;

export const getDocumentAssessmentResultParentType = (
  assessmentMode?: AssessmentTypeEnum
): DocumentAssessmentResultFormIds => {
  switch (assessmentMode) {
    case 'internal_audit_report':
      return Parent_Type_Enum.DocumentInternalAuditResult;
    case 'compliance_monitoring_assessment':
      return Parent_Type_Enum.DocumentSecondLineResult;
    case 'rating':
    default:
      return Parent_Type_Enum.DocumentAssessmentResult;
  }
};
