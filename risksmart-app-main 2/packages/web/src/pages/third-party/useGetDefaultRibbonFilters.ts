import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { options } = useRating('third_party_status');
  const { t } = useTranslation(['common'], {
    keyPrefix: 'third_party.dashboard',
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
        title: t('all'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [],
          operation: 'and',
        },
      },
    ];
  }, [options, t]);
};
