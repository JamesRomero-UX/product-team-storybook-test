import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Version_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';
import { emptyItemFilterQuery } from '@/utils/collectionUtils';

export const useGetDefaultRibbonFilters = () => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'policy.summary_category_titles',
  });
  const { getLabel: getDocumentFileStatusLabel } = useRating(
    'document_file_status'
  );
  const { getLabel: getDocumentReviewStatusLabel } = useRating(
    'document_review_status'
  );

  return useMemo<FilterModal[]>(() => {
    const statusLabels = [
      getDocumentFileStatusLabel(Version_Status_Enum.Published),
      getDocumentFileStatusLabel(Version_Status_Enum.PendingApproval),
      getDocumentFileStatusLabel(Version_Status_Enum.Draft),
    ];

    const statusFilters: FilterModal[] = statusLabels.map((label) => ({
      id: crypto.randomUUID(),
      title: label,
      itemFilterQuery: {
        tokens: [],
        tokenGroups: [
          {
            operator: '=',
            propertyKey: 'Status',
            value: label,
          },
        ],
        operation: 'and',
      },
    }));

    return [
      ...statusFilters,
      {
        id: crypto.randomUUID(),
        title: t('review_due'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '=',
              propertyKey: 'ReviewStatus',
              value: getDocumentReviewStatusLabel('due'),
            },
          ],
          operation: 'and',
        },
      },
      {
        id: crypto.randomUUID(),
        title: t('overdue'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '=',
              propertyKey: 'ReviewStatus',
              value: getDocumentReviewStatusLabel('overdue'),
            },
          ],
          operation: 'and',
        },
      },
      {
        id: crypto.randomUUID(),
        title: t('total'),
        itemFilterQuery: emptyItemFilterQuery,
      },
    ];
  }, [getDocumentFileStatusLabel, getDocumentReviewStatusLabel, t]);
};
