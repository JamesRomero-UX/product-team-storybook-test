import { Questionnaire_Template_Version_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'questionnaire_templates.dashboard',
  });

  return useMemo<FilterModal[]>(
    () => [
      {
        id: uuidv4(),
        title: t('published'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: Questionnaire_Template_Version_Status_Enum.Published,
              propertyKey: 'LatestStatus',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('archived'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: Questionnaire_Template_Version_Status_Enum.Archived,
              propertyKey: 'LatestStatus',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('draft'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: Questionnaire_Template_Version_Status_Enum.Draft,
              propertyKey: 'LatestStatus',
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
    [t]
  );
};
