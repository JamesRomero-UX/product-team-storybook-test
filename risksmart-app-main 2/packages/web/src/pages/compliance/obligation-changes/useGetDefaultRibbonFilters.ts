import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'obligationChanges.summary_category_titles',
  });
  const { t: tr } = useTranslation('ratings');

  return useMemo<FilterModal[]>(() => {
    return [
      {
        id: uuidv4(),
        title: t('unread'),
        itemFilterQuery: {
          tokens: [
            {
              propertyKey: 'Status',
              value:
                tr('obligation_change_status').find(
                  ({ value }) => value === 'unread'
                )?.label || '',
              operator: '=',
            },
          ],
          tokenGroups: [],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('total'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [],
          operation: 'and',
        },
      },
    ];
  }, [t, tr]);
};
