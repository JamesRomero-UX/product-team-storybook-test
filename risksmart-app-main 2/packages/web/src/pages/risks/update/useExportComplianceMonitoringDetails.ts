import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import {
  GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdDocument,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import { useTranslation } from 'react-i18next';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';
import { UNRATED } from 'src/pages/controls/lookupData';

import { useRiskRatingResolver } from '@/ratings/useRiskRatingResolver';
import { toLocalDate } from '@/utils/dateUtils';
import { createTable, tableHeaders } from '@/utils/pdf/table';

const useComplianceMonitoringExportTable = (
  riskId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const { getLabel: getStatusLabel } = useRating('assessment_status');
  const { resolveRiskRating, resolveImpact, resolveLikelihood } =
    useRiskRatingResolver();
  const [getAssessments, getAssessmentsResult] = useLazyQuery(
    GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdDocument,
    {
      variables: {
        RiskId: riskId,
      },
    }
  );

  const { t: assessmentsColumns } = useTranslation(['common']);
  const createExportTable = async () => {
    const { data: assessmentsData } = await getAssessments();

    const controlledAssessmentsTableData = (
      assessmentsData?.risk_controlled_second_line_result ?? []
    ).map((au) => [
      au.parents?.[0]?.complianceMonitoringAssessment?.Title ?? '-',
      getStatusLabel(au.parents?.[0]?.complianceMonitoringAssessment?.Status) ??
        '-',
      resolveRiskRating({
        likelihood: au.Likelihood,
        impact: au.Impact,
        controlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
        rating: au.Rating,
      })?.label ?? UNRATED.label,
      resolveImpact(au.Impact)?.label ?? UNRATED.label,
      resolveLikelihood(au.Likelihood)?.label ?? UNRATED.label,
      toLocalDate(au.parents?.[0]?.complianceMonitoringAssessment?.StartDate) ??
        '-',
      toLocalDate(
        au.parents?.[0]?.complianceMonitoringAssessment?.ActualCompletionDate
      ) ?? '-',
      au.parents?.[0]?.complianceMonitoringAssessment?.completedByUser
        ?.FriendlyName ?? '-',
    ]);

    const uncontrolledAssessmentsTableData = (
      assessmentsData?.risk_uncontrolled_second_line_result ?? []
    ).map((au) => [
      au.parents?.[0]?.complianceMonitoringAssessment?.Title ?? '-',
      getStatusLabel(au.parents?.[0]?.complianceMonitoringAssessment?.Status) ??
        '-',
      resolveRiskRating({
        likelihood: au.Likelihood,
        impact: au.Impact,
        controlType: Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
        rating: au.Rating,
      })?.label ?? UNRATED.label,
      resolveImpact(au.Impact)?.label ?? UNRATED.label,
      resolveLikelihood(au.Likelihood)?.label ?? UNRATED.label,
      toLocalDate(au.parents?.[0]?.complianceMonitoringAssessment?.StartDate) ??
        '-',
      toLocalDate(
        au.parents?.[0]?.complianceMonitoringAssessment?.ActualCompletionDate
      ) ?? '-',
      au.parents?.[0]?.complianceMonitoringAssessment?.completedByUser
        ?.FriendlyName ?? '-',
    ]);

    const assessmentsTableData = [
      ...controlledAssessmentsTableData,
      ...uncontrolledAssessmentsTableData,
    ];

    return createTable({
      widths: ['*', 50, 50, 50, 50, 50, 70, 70],
      body: [
        tableHeaders([
          getStandardFieldLabel('compliance_monitoring_assessment', 'Title'),
          getStandardFieldLabel('compliance_monitoring_assessment', 'Status'),
          assessmentsColumns('assessmentResults.fields.Rating'),
          assessmentsColumns('assessmentResults.fields.Impact'),
          assessmentsColumns('assessmentResults.fields.Likelihood'),
          getStandardFieldLabel(
            'compliance_monitoring_assessment',
            'StartDate'
          ),
          getStandardFieldLabel(
            'compliance_monitoring_assessment',
            'ActualCompletionDate'
          ),
          getStandardFieldLabel(
            'compliance_monitoring_assessment',
            'CompletedByUser'
          ),
        ]),
        ...assessmentsTableData,
      ],
    });
  };

  return [createExportTable, getAssessmentsResult.loading];
};

export default useComplianceMonitoringExportTable;
