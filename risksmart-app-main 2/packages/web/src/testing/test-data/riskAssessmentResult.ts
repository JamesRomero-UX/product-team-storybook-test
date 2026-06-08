import type {
  GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery,
  GetRiskAssessmentResultsByRiskIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Assessment_Status_Enum,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

const defaultRiskAssessmentResult: GetRiskAssessmentResultsByRiskIdQuery['risk_assessment_result'][number] =
  {
    Id: '9389224f-9604-4bb6-8259-553883d2bb30',
    parents: [
      {
        assessment: {
          Id: 'Assessment1',
          Title: 'Assessment Title 1!',
          CompletedByUser: 'user 1',
          CreatedByUser: 'user 3',
          CreatedAtTimestamp: '',
          ModifiedByUser: 'user 2',
          Status: Assessment_Status_Enum.Inprogress,
          Summary: 'Details',
          ModifiedAtTimestamp: '',
        },
      },
    ],
    ControlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
    Likelihood: 3,
    Impact: 3,
    Rationale: 'This is a rationale',
    Rating: 3,
  };

export const buildRiskAssessmentResult = (
  overrides: Partial<
    GetRiskAssessmentResultsByRiskIdQuery['risk_assessment_result'][number]
  > = {}
): GetRiskAssessmentResultsByRiskIdQuery['risk_assessment_result'][number] => {
  return {
    ...defaultRiskAssessmentResult,
    ...overrides,
  };
};

const defaultComplianceRiskAssessmentResult: GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery['risk_controlled_second_line_result'][number] =
  {
    Id: '9389224f-9604-4bb6-8259-553883d2bb30',
    parents: [
      {
        complianceMonitoringAssessment: {
          Id: 'CompAssessment1',
          Title: 'Comp Assessment Title 1!',
          CompletedByUser: 'user 1',
          CreatedByUser: 'user 3',
          CreatedAtTimestamp: '',
          ModifiedByUser: 'user 2',
          Status: Assessment_Status_Enum.Inprogress,
          Summary: 'Details',
          ModifiedAtTimestamp: '',
        },
      },
    ],
    Likelihood: 3,
    Impact: 3,
    Rationale: 'This is a rationale',
    Rating: 3,
  };

export const buildComplianceAssessmentRiskAssessmentResult = (
  overrides: Partial<
    GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery['risk_controlled_second_line_result'][number]
  > = {}
): GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery['risk_controlled_second_line_result'][number] => {
  return {
    ...defaultComplianceRiskAssessmentResult,
    ...overrides,
  };
};
