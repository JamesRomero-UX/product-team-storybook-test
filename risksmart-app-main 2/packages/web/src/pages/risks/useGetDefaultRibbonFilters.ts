import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'tiers',
  });

  return useMemo<FilterModal[]>(
    () => [
      {
        id: uuidv4(),
        title: t('1'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '=',
              propertyKey: 'TierLabelled',
              value: t('1'),
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('2'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '=',
              propertyKey: 'TierLabelled',
              value: t('2'),
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('3'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '=',
              propertyKey: 'TierLabelled',
              value: t('3'),
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: 'All risks',
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
