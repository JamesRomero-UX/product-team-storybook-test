import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import {
  getAllContributorsCellValue,
  getAllOwnersCellValue,
} from 'src/rbac/contributorHelper';

import { getFriendlyId } from '@/utils/friendlyId';

import type { AssessmentFields, AssessmentRegisterFields } from './types';

export const useLabelledFields = (records: AssessmentFields[] | undefined) => {
  const { getLabel: getStatusLabel } = useRating('assessment_status');
  const { getLabel: getOutcomeLabel } = useRating('assessment_outcome');
  const labelledFields = useMemo<AssessmentRegisterFields[] | undefined>(() => {
    return records?.map((d) => {
      return {
        ...d,
        SequentialIdLabel: getFriendlyId(
          Parent_Type_Enum.Assessment,
          d.SequentialId
        ),
        Title: d.Title || '-',
        CreatedBy: d.CreatedByUser || '-',
        ModifiedBy: d.ModifiedByUser || '-',
        allOwners: getAllOwnersCellValue(d),
        allContributors: getAllContributorsCellValue(d),
        completedByUser: d.completedByUser,
        Status: d.Status,
        StatusLabelled: getStatusLabel(d.Status),
        Outcome: d.Outcome,
        OutcomeLabelled: getOutcomeLabel(d.Outcome),
        AssessedItems: [
          ...d.assessedItems
            .filter((ai) => ai.documentAssessmentResult?.parents?.[0]?.document)
            .map(
              (ai) => ai.documentAssessmentResult?.parents[0].document?.Title
            ),
          ...d.assessedItems
            .filter((ai) => ai.riskAssessmentResult?.parents?.[0]?.risk)
            .map((ai) => ai.riskAssessmentResult?.parents[0].risk?.Title),
          ...d.assessedItems
            .filter(
              (ai) => ai.obligationAssessmentResult?.parents?.[0]?.obligation
            )
            .map(
              (ai) =>
                ai.obligationAssessmentResult?.parents[0].obligation?.Title
            ),
        ].join(', '),
      };
    });
  }, [records, getStatusLabel, getOutcomeLabel]);

  return labelledFields;
};
