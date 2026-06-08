import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Issue_Assessment_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { getLabel } = useRating('issue_assessment_status');
  const { t } = useTranslation(['common'], {
    keyPrefix: 'causes.dashboard',
  });

  return useMemo<FilterModal[]>(
    () => [
      {
        id: uuidv4(),
        title: t('open'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(Issue_Assessment_Status_Enum.Open),
              propertyKey: 'IssueStatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('pending'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(Issue_Assessment_Status_Enum.Pending),
              propertyKey: 'IssueStatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('closed'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(Issue_Assessment_Status_Enum.Closed),
              propertyKey: 'IssueStatusLabelled',
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
    [t, getLabel]
  );
};
