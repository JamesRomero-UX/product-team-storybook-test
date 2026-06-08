import { useMemo } from 'react';

import type {
  QuestionnaireTemplateFields,
  QuestionnaireTemplateRegisterFields,
} from './types';

export const useLabelledFields = (
  data: QuestionnaireTemplateFields[] | undefined
): QuestionnaireTemplateRegisterFields[] => {
  return useMemo(() => {
    return (
      data?.map((record) => {
        return {
          ...record,
          CreatedByFriendlyName: record.createdByUser?.FriendlyName || '-',
          ModifiedByFriendlyName: record.modifiedByUser?.FriendlyName || '-',
          LatestStatus:
            record.nonDraftVersions[0]?.Status ||
            record.draftVersions[0]?.Status ||
            '-',
        };
      }) ?? []
    );
  }, [data]);
};
