import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetRiskAssessmentResultsByRiskIdAndControlTypeDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';
import { UNRATED } from 'src/pages/controls/lookupData';

import { useRiskRatingResolver } from '@/ratings/useRiskRatingResolver';
import { toLocalDate } from '@/utils/dateUtils';
import { createTable, tableHeaders } from '@/utils/pdf/table';

const useAssessmentsExportTable = (
  riskId: string,
  controlType: Risk_Assessment_Result_Control_Type_Enum,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const { getLabel: getStatusLabel } = useRating('assessment_status');
  const { resolveRiskRating, resolveImpact, resolveLikelihood } =
    useRiskRatingResolver();
  const [getAssessments, getAssessmentsResult] = useLazyQuery(
    GetRiskAssessmentResultsByRiskIdAndControlTypeDocument,
    {
      variables: {
        RiskId: riskId,
        ControlType: controlType,
      },
    }
  );
  const formId =
    controlType === 'Controlled'
      ? 'controlled_risk_assessment_result'
      : 'uncontrolled_risk_assessment_result';

  const createExportTable = async () => {
    const { data: assessmentsData } = await getAssessments();
    const assessmentsTableData = (
      assessmentsData?.risk_assessment_result ?? []
    ).map((au) => [
      au.parents?.[0]?.assessment?.Title ?? '-',
      getStatusLabel(au.parents?.[0]?.assessment?.Status) ?? '-',
      resolveRiskRating({
        likelihood: au.Likelihood,
        impact: au.Impact,
        controlType,
        rating: au.Rating,
      })?.label ?? UNRATED.label,
      resolveImpact(au.Impact)?.label ?? UNRATED.label,
      resolveLikelihood(au.Likelihood)?.label ?? UNRATED.label,
      toLocalDate(au.parents?.[0]?.assessment?.StartDate) ?? '-',
      toLocalDate(au.parents?.[0]?.assessment?.ActualCompletionDate) ?? '-',
      au.parents?.[0]?.assessment?.completedByUser?.FriendlyName ?? '-',
    ]);

    return createTable({
      widths: '*',
      body: [
        tableHeaders([
          getStandardFieldLabel('assessment', 'Title'),
          getStandardFieldLabel('assessment', 'Status'),
          getStandardFieldLabel(formId, 'Rating'),
          getStandardFieldLabel(formId, 'Impact'),
          getStandardFieldLabel(formId, 'Likelihood'),
          getStandardFieldLabel('assessment', 'StartDate'),
          getStandardFieldLabel('assessment', 'ActualCompletionDate'),
          getStandardFieldLabel('assessment', 'CompletedByUser'),
        ]),
        ...assessmentsTableData,
      ],
    });
  };

  return [createExportTable, getAssessmentsResult.loading];
};

export default useAssessmentsExportTable;
