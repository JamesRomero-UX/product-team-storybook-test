import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { GetAssessmentResultsByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import { useTranslation } from 'react-i18next';
import { useControlTypeLabel } from 'src/pages/assessments/forms/useControlTypeLabel';
import { getAssessmentResultTableFields } from 'src/pages/assessments/update/tabs/results/assessmentRatingRegisterUtils';
import {
  decorateWithControlType,
  getParentTitle,
} from 'src/pages/assessments/update/tabs/results/helpers';
import type { AssessmentResultFields } from 'src/pages/assessments/update/tabs/results/types';

import { useRiskScoreFormatters } from '@/hooks/useRiskScore';
import { toLocalDate } from '@/utils/dateUtils';
import { createTable, tableHeaders } from '@/utils/pdf/table';

const useAssessmentResultExportTable = (
  assessmentId: string
): [() => Promise<ContentTable>, boolean] => {
  const [getAssessmentResults, getAssessmentResultsResult] = useLazyQuery(
    GetAssessmentResultsByParentIdDocument,
    {
      variables: {
        ParentId: assessmentId,
      },
    }
  );
  const { t: at } = useTranslation('common', {
    keyPrefix: 'assessmentResults',
  });
  const assessmentResultTypes = at('resultTypes', { returnObjects: true });
  const getControlTypeLabel = useControlTypeLabel();
  const getFormatters = useRiskScoreFormatters();
  const { getByValue: getByResultValue } = useRating('performance_result');
  const { getByValue: getEffectivenessByValue } = useRating('effectiveness');
  const { t: assessmentResultsColumns } = useTranslation(['common'], {
    keyPrefix: 'assessmentResults.columns',
  });
  const createAssessmentResultsTable = async () => {
    const { data: assessmentResultsData } = await getAssessmentResults();
    const mappedData = getAssessmentResultTableFields(
      assessmentResultsData,
      assessmentId
    );

    const ratingFns = {
      document_second_line_result: (d: AssessmentResultFields) =>
        getByResultValue(d.Rating),
      obligation_second_line_result: (d: AssessmentResultFields) =>
        getByResultValue(d.Rating),
      control_test_second_line_result: (d: AssessmentResultFields) =>
        getEffectivenessByValue(d.OverallEffectiveness),
      risk_controlled_second_line_result: ({
        Rating,
        Likelihood,
        Impact,
        ControlType,
      }: AssessmentResultFields) => {
        if (Rating == null || ControlType == null) {
          return;
        }

        const { getResidualLabel } = getFormatters({
          residualRating: Rating,
          residualLikelihood: Likelihood,
          residualImpact: Impact,
        });

        return {
          label: getResidualLabel(),
        };
      },
      risk_uncontrolled_second_line_result: ({
        Rating,
        Likelihood,
        Impact,
        ControlType,
      }: AssessmentResultFields) => {
        if (Rating == null || ControlType == null) {
          return;
        }

        const { getInherentLabel } = getFormatters({
          inherentRating: Rating,
          inherentLikelihood: Likelihood,
          inherentImpact: Impact,
        });

        return {
          label: getInherentLabel(),
        };
      },
    };
    const mappedData2 = mappedData?.map((d) => {
      return {
        ...d,
        TypeLabelled: decorateWithControlType(
          assessmentResultTypes[
            d.typename as keyof typeof assessmentResultTypes
          ],
          getControlTypeLabel,
          d
        ),
        ParentTitle: getParentTitle(d) || '-',
        RatingLabelled:
          ratingFns[d.typename as keyof typeof ratingFns](d)?.label || '-',
        Rationale: d.Rationale,
        TestDate: d.TestDate,
      };
    });

    const assessmentResultsTableData = (mappedData2 ?? []).map(
      (assessmentResult) => [
        assessmentResult.TypeLabelled,
        assessmentResult.ParentTitle,
        assessmentResult.RatingLabelled ?? '',
        toLocalDate(assessmentResult.TestDate) ?? '-',
      ]
    );

    return createTable({
      widths: [70, '*', 50, 70],
      body: [
        tableHeaders([
          assessmentResultsColumns('Type'),
          assessmentResultsColumns('Item'),
          assessmentResultsColumns('Result'),
          assessmentResultsColumns('TestDate'),
        ]),
        ...assessmentResultsTableData,
      ],
    });
  };

  return [createAssessmentResultsTable, getAssessmentResultsResult.loading];
};

export default useAssessmentResultExportTable;
