import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';

import type {
  ThirdPartyResponseFields,
  ThirdPartyResponseRegisterFields,
} from './types';

export const useLabelledFields = (
  data: ThirdPartyResponseFields[] | undefined
): ThirdPartyResponseRegisterFields[] => {
  const { getLabel } = useRating('third_party_response_status');

  return useMemo(() => {
    return (
      data?.map((record) => ({
        ...record,
        StatusLabelled: getLabel(record.Status),
        ThirdPartyName: record.thirdParty?.Title ?? '-',
        QuestionnaireVersion:
          record.questionnaireTemplateVersion?.Version ?? '-',
        QuestionnaireTitle:
          record.questionnaireTemplateVersion?.parent?.Title ?? '-',
        Respondents:
          record.invitees.map((invitee) => invitee.UserEmail).join(', ') ?? '-',
      })) ?? []
    );
  }, [data, getLabel]);
};
