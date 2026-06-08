import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Action_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { getLabel } = useRating('action_status');
  const { t } = useTranslation(['common'], {
    keyPrefix: 'actions.dashboard',
  });

  return useMemo(
    () => [
      {
        id: uuidv4(),
        title: t('open_actions'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(Action_Status_Enum.Closed),
              propertyKey: 'StatusLabelled',
              operator: '!=',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('overdue'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '!=',
              propertyKey: 'StatusLabelled',
              value: 'Closed',
            },
            {
              operator: '=',
              propertyKey: 'DateDue',
              value: {
                type: 'relative',
                unit: 'year',
                amount: -3,
              },
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('due_today'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '!=',
              propertyKey: 'StatusLabelled',
              value: 'Closed',
            },
            {
              operator: '=',
              propertyKey: 'DateDue',
              value: {
                type: 'relative',
                unit: 'day',
                amount: 1,
              },
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('due_this_week'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '!=',
              propertyKey: 'StatusLabelled',
              value: 'Closed',
            },
            {
              operator: '=',
              propertyKey: 'DateDue',
              value: {
                type: 'relative',
                unit: 'week',
                amount: 1,
              },
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('due_this_month'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '!=',
              propertyKey: 'StatusLabelled',
              value: 'Closed',
            },
            {
              operator: '=',
              propertyKey: 'DateDue',
              value: {
                type: 'relative',
                unit: 'month',
                amount: 1,
              },
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
