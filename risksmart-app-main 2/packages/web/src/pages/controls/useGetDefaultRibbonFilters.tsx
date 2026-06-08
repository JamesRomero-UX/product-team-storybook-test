import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UNRATED } from 'src/pages/controls/lookupData';
import type { RatingOption } from 'src/ratings/ratings';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

const effectivenessValueFilters = (
  effectivenessValues: RatingOption[]
): FilterModal[] => {
  return effectivenessValues.map(({ label }) => ({
    id: uuidv4(),
    title: label,
    itemFilterQuery: {
      tokens: [],
      tokenGroups: [
        {
          propertyKey: 'OverallEffectivenessLabelled',
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
    keyPrefix: 'controls.dashboard',
  });

  const { options } = useRating('effectiveness');

  // TODO This `map` feels inconsistent with the rest of the codebase
  const effectivenessValues = [
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
      ...effectivenessValueFilters(effectivenessValues),
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
    [effectivenessValues, t]
  );
};
