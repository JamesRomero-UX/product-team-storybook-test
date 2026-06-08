import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UNRATED } from 'src/pages/controls/lookupData';
import type { RatingOption } from 'src/ratings/ratings';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

const criticalityValueFilters = (
  criticalityValues: RatingOption[]
): FilterModal[] => {
  return criticalityValues.map(({ label }) => ({
    id: uuidv4(),
    title: label,
    itemFilterQuery: {
      tokens: [],
      tokenGroups: [
        {
          propertyKey: 'CriticalityLabelled',
          value: label,
          operator: '=',
        },
      ],
      operation: 'and',
    },
  }));
};

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'consequences.dashboard',
  });

  const { options } = useRating('criticality');

  const criticalityValues = [
    ...options,
    {
      value: UNRATED.label,
      label: UNRATED.label,
    },
  ].map(({ value, label }) => ({
    value: String(value),
    label,
  }));

  return useMemo(
    () => [
      ...criticalityValueFilters(criticalityValues),
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
    [t, criticalityValues]
  );
};
