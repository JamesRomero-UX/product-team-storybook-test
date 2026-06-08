import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { user } = useRisksmartUser();
  const { options } = useRating('approval_status');
  const { t } = useTranslation(['common'], {
    keyPrefix: 'approvals.requestsRegister.summary',
  });

  return useMemo<FilterModal[]>(() => {
    const filters: FilterModal[] = (options ?? []).map(({ label }) => ({
      id: uuidv4(),
      title: label,
      itemFilterQuery: {
        tokens: [],
        tokenGroups: [
          {
            operator: '=',
            propertyKey: 'StatusLabelled',
            value: label,
          },
        ],
        operation: 'and',
      },
    }));

    return [
      ...filters,
      {
        id: uuidv4(),
        title: t('requiresAction'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'RequiresAction',
              value: 'true',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('myRequests'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'allRequesters',
              value: user?.userId ?? '',
              operator: ':',
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
    ];
  }, [options, t, user]);
};
