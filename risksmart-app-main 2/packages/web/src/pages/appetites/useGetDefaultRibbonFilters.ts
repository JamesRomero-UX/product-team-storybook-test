import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

import { APPETITE_PERFORMANCE } from './calculateAppetitePerformance';

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { getLabel } = useRating('appetite_performance');
  const { t } = useTranslation(['common'], {
    keyPrefix: 'appetites.dashboard',
  });

  return useMemo(
    () => [
      {
        id: uuidv4(),
        title: t('outside'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(APPETITE_PERFORMANCE.OUTSIDE),
              propertyKey: 'PerformanceLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('inside'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(APPETITE_PERFORMANCE.INSIDE),
              propertyKey: 'PerformanceLabelled',
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
