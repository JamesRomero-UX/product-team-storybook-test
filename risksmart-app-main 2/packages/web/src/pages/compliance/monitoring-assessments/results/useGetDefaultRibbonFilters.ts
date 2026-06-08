import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AssessmentStatus } from 'src/pages/assessments/config';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { getLabel } = useRating('assessment_status');
  const { t } = useTranslation(['common'], {
    keyPrefix: 'assessmentResults.dashboard',
  });

  return useMemo<FilterModal[]>(
    () => [
      {
        id: uuidv4(),
        title: t('complete'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(AssessmentStatus.Complete),
              propertyKey: 'StatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('not_started'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(AssessmentStatus.NotStarted),
              propertyKey: 'StatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('in_progress'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(AssessmentStatus.Inprogress),
              propertyKey: 'StatusLabelled',
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
