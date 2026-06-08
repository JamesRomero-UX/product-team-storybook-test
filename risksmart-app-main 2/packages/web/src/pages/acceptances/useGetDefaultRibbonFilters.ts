import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Acceptance_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { getLabel } = useRating('acceptance_status');
  const { t } = useTranslation(['common'], {
    keyPrefix: 'acceptances.dashboard',
  });

  return useMemo(
    () => [
      {
        id: uuidv4(),
        title: t('open'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(Acceptance_Status_Enum.Open),
              propertyKey: 'StatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('closed'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(Acceptance_Status_Enum.Closed),
              propertyKey: 'StatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('declined'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '=',
              propertyKey: 'StatusLabelled',
              value: getLabel(Acceptance_Status_Enum.Declined),
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('draft'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '=',
              propertyKey: 'StatusLabelled',
              value: getLabel(Acceptance_Status_Enum.Pending),
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
