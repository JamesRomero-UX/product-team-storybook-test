import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AssessmentStatus } from 'src/pages/assessments/config';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { getLabel: getStatusLabel } = useRating('assessment_status');
  const { t } = useTranslation(['common'], {
    keyPrefix: 'complianceMonitoringAssessment.summary_category_titles',
  });

  return useMemo<FilterModal[]>(() => {
    return [
      {
        id: uuidv4(),
        title: t('due'),
        itemFilterQuery: {
          tokens: [
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
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('overdue'),
        itemFilterQuery: {
          tokens: [
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
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('assessment_in_progress'),
        itemFilterQuery: {
          tokens: [
            {
              propertyKey: 'StatusLabelled',
              value: getStatusLabel(AssessmentStatus.Inprogress) || '',
              operator: '=',
            },
          ],
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
  }, [t, getStatusLabel]);
};
