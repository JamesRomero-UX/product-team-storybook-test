import { useQuery } from '@apollo/client';
import { useKnockFeed } from '@knocklabs/react';
import Count from '@risksmart-app/components/src/navigation/Count';
import type {
  Acceptance_Bool_Exp,
  Cause_Bool_Exp,
  Consequence_Bool_Exp,
  Control_Bool_Exp,
  Issue_Bool_Exp,
  Risk_Bool_Exp,
  Test_Result_Bool_Exp,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetAcceptanceCountDocument,
  GetAppetiteCountDocument,
  GetAssessmentActivityCountDocument,
  GetAssessmentCountDocument,
  GetAssessmentResultCountDocument,
  GetCauseCountDocument,
  GetComplianceMonitoringAssessmentCountDocument,
  GetComplianceMonitoringAssessmentResultCountDocument,
  GetConsequenceCountDocument,
  GetControlCountDocument,
  GetControlGroupCountDocument,
  GetImpactCountDocument,
  GetImpactRatingCountDocument,
  GetInternalAuditReportCountDocument,
  GetInternalAuditReportResultCountDocument,
  GetIssueCountDocument,
  GetRiskCountDocument,
  GetTestResultCountDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';

export const CountOptions = [
  'issue',
  'issueRiskEvent',
  'issueBreachLog',
  'issueConsumerDuty',
  'issueCustomerTrust',
  'issueGDPRBreachLog',
  'issuePCIBreachLog',
  'issueSARLog',
  'risk',
  'acceptance',
  'appetite',
  'notification',
  'impact',
  'impactRating',
  'assessment',
  'internalAudit',
  'internalAuditReport',
  'assessmentResult',
  'assessmentActivity',
  'internalAuditReportResult',
  'complianceMonitoringAssessment',
  'complianceMonitoringAssessmentResult',
  'consequence',
  'cause',
  'request',
  'control',
  'controlGroup',
  'testResult',
] as const;

export type TCountOptions = (typeof CountOptions)[number];

const ConnectedCount: FC<{
  isActive?: boolean;
  badge?: boolean;
  countName: TCountOptions;
}> = ({ isActive, badge, countName }) => {
  const knock = useKnockFeed();

  const issueCountWhere = useEntityWhereFilter<Issue_Bool_Exp>(
    Parent_Type_Enum.Issue,
    {
      Type: {
        _eq: 'issue',
      },
    }
  );
  const { data: issueData } = useQuery(GetIssueCountDocument, {
    variables: {
      where: issueCountWhere,
    },
    skip: countName !== 'issue',
  });
  const { data: issueRiskEventData } = useQuery(GetIssueCountDocument, {
    variables: {
      where: {
        Type: {
          _eq: 'issue_risk_event',
        },
      },
    },
    skip: countName !== 'issueRiskEvent',
  });
  const { data: issueConsumerDutyData } = useQuery(GetIssueCountDocument, {
    variables: {
      where: {
        Type: {
          _eq: 'issue_consumer_duty',
        },
      },
    },
    skip: countName !== 'issueConsumerDuty',
  });
  const { data: issueCustomerTrustData } = useQuery(GetIssueCountDocument, {
    variables: {
      where: {
        Type: {
          _eq: 'issue_customer_trust',
        },
      },
    },
    skip: countName !== 'issueCustomerTrust',
  });
  const { data: issueGDPRBreachLogData } = useQuery(GetIssueCountDocument, {
    variables: {
      where: {
        Type: {
          _eq: 'issue_gdpr_breach_log',
        },
      },
    },
    skip: countName !== 'issueGDPRBreachLog',
  });
  const { data: issuePCIBreachLogData } = useQuery(GetIssueCountDocument, {
    variables: {
      where: {
        Type: {
          _eq: 'issue_pci_breach_log',
        },
      },
    },
    skip: countName !== 'issuePCIBreachLog',
  });
  const { data: issueSARLogData } = useQuery(GetIssueCountDocument, {
    variables: {
      where: {
        Type: {
          _eq: 'issue_sar_log',
        },
      },
    },
    skip: countName !== 'issueSARLog',
  });
  const { data: issueBreachLogData } = useQuery(GetIssueCountDocument, {
    variables: {
      where: {
        Type: {
          _eq: 'issue_breach_log',
        },
      },
    },
    skip: countName !== 'issueBreachLog',
  });

  const consequenceCountWhere = useEntityWhereFilter<Consequence_Bool_Exp>(
    Parent_Type_Enum.Consequence
  );
  const { data: consequenceData } = useQuery(GetConsequenceCountDocument, {
    variables: { where: consequenceCountWhere },
    skip: countName !== 'consequence',
  });

  const causeCountWhere = useEntityWhereFilter<Cause_Bool_Exp>(
    Parent_Type_Enum.Cause
  );
  const { data: causeData } = useQuery(GetCauseCountDocument, {
    variables: { where: causeCountWhere },
    skip: countName !== 'cause',
  });

  const { data: impactData } = useQuery(GetImpactCountDocument, {
    skip: countName !== 'impact',
  });
  const { data: impactRatingData } = useQuery(GetImpactRatingCountDocument, {
    skip: countName !== 'impactRating',
  });

  const riskCountWhere = useEntityWhereFilter<Risk_Bool_Exp>(
    Parent_Type_Enum.Risk
  );
  const { data: riskData } = useQuery(GetRiskCountDocument, {
    variables: { where: riskCountWhere },
    skip: countName !== 'risk',
  });

  // Appetite count is based on the risks
  const appetiteCountWhere = useEntityWhereFilter<Risk_Bool_Exp>(
    Parent_Type_Enum.Risk,
    { appetites_aggregate: { count: { predicate: { _gte: 1 } } } }
  );
  const { data: appetiteData } = useQuery(GetAppetiteCountDocument, {
    variables: { where: appetiteCountWhere },
    skip: countName !== 'appetite',
  });

  const acceptanceCountWhere = useEntityWhereFilter<Acceptance_Bool_Exp>(
    Parent_Type_Enum.Acceptance
  );
  const { data: acceptanceData } = useQuery(GetAcceptanceCountDocument, {
    variables: { where: acceptanceCountWhere },
    skip: countName !== 'acceptance',
  });
  const { data: assessmentData } = useQuery(GetAssessmentCountDocument, {
    skip: countName !== 'assessment',
  });
  const { data: internalAuditReportData } = useQuery(
    GetInternalAuditReportCountDocument,
    {
      skip: countName !== 'internalAuditReport',
    }
  );
  const { data: complianceMonitoringAssessmentData } = useQuery(
    GetComplianceMonitoringAssessmentCountDocument,
    {
      skip: countName !== 'complianceMonitoringAssessment',
    }
  );
  const { data: assessmentResultData } = useQuery(
    GetAssessmentResultCountDocument,
    {
      skip: countName !== 'assessmentResult',
    }
  );

  const { data: assessmentActivityData } = useQuery(
    GetAssessmentActivityCountDocument,
    {
      skip: countName !== 'assessmentActivity',
    }
  );

  const { data: internalAuditReportResultData } = useQuery(
    GetInternalAuditReportResultCountDocument,
    {
      skip: countName !== 'internalAuditReportResult',
    }
  );

  const { data: complianceMonitoringAssessmentResultData } = useQuery(
    GetComplianceMonitoringAssessmentResultCountDocument,
    {
      skip: countName !== 'complianceMonitoringAssessmentResult',
    }
  );

  const controlCountWhere = useEntityWhereFilter<Control_Bool_Exp>(
    Parent_Type_Enum.Control
  );
  const { data: controlData } = useQuery(GetControlCountDocument, {
    variables: { where: controlCountWhere },
    skip: countName !== 'control',
  });
  const { data: controlGroupData } = useQuery(GetControlGroupCountDocument, {
    skip: countName !== 'controlGroup',
  });

  const testResultCountWhere = useEntityWhereFilter<Test_Result_Bool_Exp>(
    Parent_Type_Enum.TestResult,
    { RatingType: { _in: ['assessment', 'rating'] } }
  );
  const { data: testResultData } = useQuery(GetTestResultCountDocument, {
    variables: { where: testResultCountWhere },
    skip: countName !== 'testResult',
  });
  const notificationsCount = knock.useFeedStore(
    (state) => state.items.filter((i) => !i.read_at).length
  );

  let count: number | undefined = undefined;
  switch (countName) {
    case 'notification':
      count = notificationsCount;
      break;
    case 'issue':
      count = issueData?.issue_aggregate.aggregate?.count;
      break;
    case 'issueBreachLog':
      count = issueBreachLogData?.issue_aggregate.aggregate?.count;
      break;
    case 'issueConsumerDuty':
      count = issueConsumerDutyData?.issue_aggregate.aggregate?.count;
      break;
    case 'issueCustomerTrust':
      count = issueCustomerTrustData?.issue_aggregate.aggregate?.count;
      break;
    case 'issueGDPRBreachLog':
      count = issueGDPRBreachLogData?.issue_aggregate.aggregate?.count;
      break;
    case 'issuePCIBreachLog':
      count = issuePCIBreachLogData?.issue_aggregate.aggregate?.count;
      break;
    case 'issueSARLog':
      count = issueSARLogData?.issue_aggregate.aggregate?.count;
      break;
    case 'issueRiskEvent':
      count = issueRiskEventData?.issue_aggregate.aggregate?.count;
      break;
    case 'cause':
      count = causeData?.cause_aggregate.aggregate?.count;
      break;
    case 'consequence':
      count = consequenceData?.consequence_aggregate.aggregate?.count;
      break;
    case 'risk':
      count = riskData?.risk_aggregate.aggregate?.count;
      break;
    case 'acceptance':
      count = acceptanceData?.acceptance_aggregate?.aggregate?.count;
      break;
    case 'appetite':
      count = appetiteData?.risk_aggregate.aggregate?.count;
      break;
    case 'impact':
      count = impactData?.impact_aggregate.aggregate?.count;
      break;
    case 'impactRating':
      count = impactRatingData?.impact_rating_aggregate.aggregate?.count;
      break;
    case 'assessment':
      count = assessmentData?.assessment_aggregate.aggregate?.count;
      break;
    case 'internalAuditReport':
      count =
        internalAuditReportData?.internal_audit_report_aggregate.aggregate
          ?.count;
      break;
    case 'internalAuditReportResult':
      count =
        (internalAuditReportResultData?.document_internal_audit_result_aggregate
          .aggregate?.count ?? 0) +
        (internalAuditReportResultData
          ?.obligation_internal_audit_result_aggregate.aggregate?.count ?? 0) +
        (internalAuditReportResultData
          ?.risk_controlled_internal_audit_result_aggregate.aggregate?.count ??
          0) +
        (internalAuditReportResultData
          ?.risk_uncontrolled_internal_audit_result_aggregate.aggregate
          ?.count ?? 0);
      break;
    case 'complianceMonitoringAssessment':
      count =
        complianceMonitoringAssessmentData
          ?.compliance_monitoring_assessment_aggregate.aggregate?.count;
      break;
    case 'complianceMonitoringAssessmentResult':
      count =
        (complianceMonitoringAssessmentResultData
          ?.document_second_line_result_aggregate.aggregate?.count ?? 0) +
        (complianceMonitoringAssessmentResultData
          ?.obligation_second_line_result_aggregate.aggregate?.count ?? 0) +
        (complianceMonitoringAssessmentResultData
          ?.risk_controlled_second_line_result_aggregate.aggregate?.count ??
          0) +
        (complianceMonitoringAssessmentResultData
          ?.risk_uncontrolled_second_line_result_aggregate.aggregate?.count ??
          0);
      break;
    case 'control':
      count = controlData?.control_aggregate.aggregate?.count;
      break;
    case 'controlGroup':
      count = controlGroupData?.control_group_aggregate.aggregate?.count;
      break;
    case 'testResult':
      count = testResultData?.test_result_aggregate.aggregate?.count;
      break;
    case 'assessmentResult':
      count =
        (assessmentResultData?.document_assessment_result_aggregate.aggregate
          ?.count ?? 0) +
        (assessmentResultData?.obligation_assessment_result_aggregate.aggregate
          ?.count ?? 0) +
        (assessmentResultData?.risk_assessment_result_aggregate.aggregate
          ?.count ?? 0);
      break;
    case 'assessmentActivity':
      count =
        assessmentActivityData?.assessment_activity_aggregate.aggregate?.count;
      break;
  }

  return <Count count={count} badge={badge} isActive={isActive} />;
};

export default ConnectedCount;
