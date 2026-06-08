import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { options } = useRating('effectiveness');
  const { t } = useTranslation(['common'], {
    keyPrefix: 'testResults.summary_category_titles',
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
            propertyKey: 'OverallEffectivenessLabelled',
            value: label || '',
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
