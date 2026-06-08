import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import {
  GetInternalAuditReportRiskAssessmentResultsByRiskIdDocument,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import { useTranslation } from 'react-i18next';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';
import { UNRATED } from 'src/pages/controls/lookupData';

import { useRiskRatingResolver } from '@/ratings/useRiskRatingResolver';
import { toLocalDate } from '@/utils/dateUtils';
import { createTable, tableHeaders } from '@/utils/pdf/table';

const useInternalAuditsExportTable = (
  riskId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const { getLabel: getStatusLabel } = useRating('assessment_status');
  const { resolveRiskRating, resolveImpact, resolveLikelihood } =
    useRiskRatingResolver();
  const [getAssessments, getAssessmentsResult] = useLazyQuery(
    GetInternalAuditReportRiskAssessmentResultsByRiskIdDocument,
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
      assessmentsData?.risk_controlled_internal_audit_result ?? []
    ).map((au) => [
      au.parents?.[0]?.internalAuditReport?.Title ?? '-',
      getStatusLabel(au.parents?.[0]?.internalAuditReport?.Status) ?? '-',
      resolveRiskRating({
        likelihood: au.Likelihood,
        impact: au.Impact,
        controlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
        rating: au.Rating,
      })?.label ?? UNRATED.label,
      resolveImpact(au.Impact)?.label ?? UNRATED.label,
      resolveLikelihood(au.Likelihood)?.label ?? UNRATED.label,
      toLocalDate(au.parents?.[0]?.internalAuditReport?.StartDate) ?? '-',
      toLocalDate(au.parents?.[0]?.internalAuditReport?.ActualCompletionDate) ??
        '-',
      au.parents?.[0]?.internalAuditReport?.completedByUser?.FriendlyName ??
        '-',
    ]);

    const uncontrolledAssessmentsTableData = (
      assessmentsData?.risk_uncontrolled_internal_audit_result ?? []
    ).map((au) => [
      au.parents?.[0]?.internalAuditReport?.Title ?? '-',
      getStatusLabel(au.parents?.[0]?.internalAuditReport?.Status) ?? '-',
      resolveRiskRating({
        likelihood: au.Likelihood,
        impact: au.Impact,
        controlType: Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
        rating: au.Rating,
      })?.label ?? UNRATED.label,
      resolveImpact(au.Impact)?.label ?? UNRATED.label,
      resolveLikelihood(au.Likelihood)?.label ?? UNRATED.label,
      toLocalDate(au.parents?.[0]?.internalAuditReport?.StartDate) ?? '-',
      toLocalDate(au.parents?.[0]?.internalAuditReport?.ActualCompletionDate) ??
        '-',
      au.parents?.[0]?.internalAuditReport?.completedByUser?.FriendlyName ??
        '-',
    ]);

    const assessmentsTableData = [
      ...controlledAssessmentsTableData,
      ...uncontrolledAssessmentsTableData,
    ];

    return createTable({
      widths: ['*', 50, 50, 50, 50, 50, 70, 70],
      body: [
        tableHeaders([
          getStandardFieldLabel('internal_audit_report', 'Title'),
          getStandardFieldLabel('internal_audit_report', 'Status'),
          assessmentsColumns('assessmentResults.fields.Rating'),
          assessmentsColumns('assessmentResults.fields.Impact'),
          assessmentsColumns('assessmentResults.fields.Likelihood'),
          getStandardFieldLabel('internal_audit_report', 'StartDate'),
          getStandardFieldLabel(
            'internal_audit_report',
            'ActualCompletionDate'
          ),
          getStandardFieldLabel('internal_audit_report', 'CompletedByUser'),
        ]),
        ...assessmentsTableData,
      ],
    });
  };

  return [createExportTable, getAssessmentsResult.loading];
};

export default useInternalAuditsExportTable;
