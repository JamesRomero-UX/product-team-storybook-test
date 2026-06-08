import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'indicators.summary_titles',
  });
  const { t: stc } = useTranslation(['taxonomy']);
  const { getLabel: getConformanceLabel } = useRating(
    'indicator_conformance_status'
  );

  return useMemo<FilterModal[]>(
    () => [
      {
        id: uuidv4(),
        title: t('risk_indicators'),
        itemFilterQuery: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'ParentType',
              value: stc('risk_one'),
              operator: ':',
            },
          ],
        },
      },
      {
        id: uuidv4(),
        title: t('control_indicators'),
        itemFilterQuery: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'ParentType',
              value: stc('control_one'),
              operator: ':',
            },
          ],
        },
      },
      {
        id: uuidv4(),
        title: t('within_tolerance'),
        itemFilterQuery: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'ConformanceLabelled',
              value: getConformanceLabel(2),
              operator: '=',
            },
          ],
        },
      },
      {
        id: uuidv4(),
        title: t('outside_tolerance'),
        itemFilterQuery: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'ConformanceLabelled',
              value: getConformanceLabel(1),
              operator: '=',
            },
          ],
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
    [t, stc, getConformanceLabel]
  );
};
