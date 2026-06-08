import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';

import type {
  QuestionnaireTemplateVersionFields,
  QuestionnaireTemplateVersionRegisterFields,
} from '../../../types';

export const useLabelledFields = (
  data: QuestionnaireTemplateVersionFields[] | undefined
): QuestionnaireTemplateVersionRegisterFields[] => {
  const { getLabel } = useRating('questionnaire_template_version_status');

  return useMemo(() => {
    return (
      data?.map((record) => {
        return {
          ...record,
          StatusLabelled: getLabel(record.Status),
          CreatedByFriendlyName: record.createdByUser?.FriendlyName || '-',
          ModifiedByFriendlyName: record.modifiedByUser?.FriendlyName || '-',
        };
      }) ?? []
    );
  }, [data, getLabel]);
};
