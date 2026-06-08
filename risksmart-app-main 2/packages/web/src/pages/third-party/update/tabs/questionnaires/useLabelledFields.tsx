import { useMemo } from 'react';

import type {
  ThirdPartyResponseFields,
  ThirdPartyResponseRegisterFields,
} from './types';

export const useLabelledFields = (
  data: ThirdPartyResponseFields[] | undefined
): ThirdPartyResponseRegisterFields[] => {
  return useMemo(() => {
    return (
      data?.map((record) => ({
        ...record,
        Questionnaire:
          record.questionnaireTemplateVersion?.parent?.Title || '-',
        QuestionnaireVersion:
          record.questionnaireTemplateVersion?.Version || '-',
        CreatedByFriendlyName: record.createdByUser?.FriendlyName || '-',
        ModifiedByFriendlyName: record.modifiedByUser?.FriendlyName || '-',
        StartDate: record.StartDate || '-',
        ExpiresAt: record.ExpiresAt || '-',
        UserEmail:
          record.invitees.map((invitee) => invitee.UserEmail).join(', ') ?? '-',
      })) ?? []
    );
  }, [data]);
};
