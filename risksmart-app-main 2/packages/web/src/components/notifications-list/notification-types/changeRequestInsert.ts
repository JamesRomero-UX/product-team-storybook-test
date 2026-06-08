import i18n from '@risksmart-app/i18n/src/i18n';

import { requestsRegisterUrl } from '@/utils/urls';

import type { GetItem } from './types';

export const getItem: GetItem = (item) => {
  const id = item.data?.objectSequenceId;

  return {
    message: i18n.t('notifications.messages.changeRequestInsert'),
    id: null,
    url: id
      ? requestsRegisterUrl({
          tokens: [
            {
              propertyKey: 'SequentialId',
              operator: '=',
              value: id,
            },
          ],
          operation: 'and',
        })
      : null,
  };
};
