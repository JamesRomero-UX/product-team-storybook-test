import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Third_Party_Response_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { getLabel } = useRating('third_party_response_status');
  const { t } = useTranslation(['common'], {
    keyPrefix: 'third_party_responses.dashboard',
  });

  return useMemo<FilterModal[]>(
    () => [
      {
        id: uuidv4(),
        title: t('completed'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(Third_Party_Response_Status_Enum.Completed),
              propertyKey: 'StatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('awaiting_review'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(Third_Party_Response_Status_Enum.AwaitingReview),
              propertyKey: 'StatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('in_progress'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(Third_Party_Response_Status_Enum.InProgress),
              propertyKey: 'StatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('not_started'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(Third_Party_Response_Status_Enum.NotStarted),
              propertyKey: 'StatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('rejected'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(Third_Party_Response_Status_Enum.Rejected),
              propertyKey: 'StatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('all'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [],
          operation: 'and',
        },
      },
    ],
    [getLabel, t]
  );
};
