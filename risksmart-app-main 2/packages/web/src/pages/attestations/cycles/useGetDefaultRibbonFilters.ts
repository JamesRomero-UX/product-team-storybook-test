import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'attestations.summary_category_titles',
  });

  return useMemo(
    () => [
      {
        id: uuidv4(),
        title: t('active'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '=',
              propertyKey: 'CycleStatusLabelled',
              value: 'Active',
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
              operator: '=',
              propertyKey: 'CycleStatusLabelled',
              value: 'Overdue',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('concluded'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '=',
              propertyKey: 'CycleStatusLabelled',
              value: 'Concluded',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('all_cycles'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [],
          operation: 'and',
        },
      },
    ],
    [t]
  );
};
