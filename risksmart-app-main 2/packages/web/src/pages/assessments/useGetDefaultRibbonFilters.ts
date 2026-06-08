import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AssessmentStatus } from 'src/pages/assessments/config';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'assessments.summary_category_titles',
  });

  const { getLabel: getStatusLabel } = useRating('assessment_status');

  return useMemo<FilterModal[]>(
    () => [
      {
        id: uuidv4(),
        title: t('due'),
        itemFilterQuery: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'TargetCompletionDate',
              value: {
                type: 'relative',
                unit: 'month',
                amount: 1,
              },
              operator: '=',
            },
            {
              propertyKey: 'StatusLabelled',
              value: getStatusLabel(AssessmentStatus.Complete),
              operator: '!=',
            },
          ],
        },
      },
      {
        id: uuidv4(),
        title: t('overdue'),
        itemFilterQuery: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'TargetCompletionDate',
              value: {
                type: 'relative',
                unit: 'year',
                amount: -3,
              },
              operator: '=',
            },
            {
              propertyKey: 'StatusLabelled',
              value: getStatusLabel(AssessmentStatus.Complete),
              operator: '!=',
            },
          ],
        },
      },
      {
        id: uuidv4(),
        title: t('assessment_in_progress'),
        itemFilterQuery: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'StatusLabelled',
              value: getStatusLabel(AssessmentStatus.Inprogress) || '',
              operator: '=',
            },
          ],
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
    ],
    [t, getStatusLabel]
  );
};
