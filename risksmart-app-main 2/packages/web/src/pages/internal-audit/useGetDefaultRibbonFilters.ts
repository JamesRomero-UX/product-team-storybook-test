import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

import { ReportStatusEnum } from './useLabelledFields';

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { getLabel } = useRating(
    'internal_audit_entity_status',
    'internal_audit'
  );
  const { t } = useTranslation(['common'], {
    keyPrefix: 'internalAudits.register_default_filters',
  });

  return useMemo<FilterModal[]>(
    () => [
      {
        id: uuidv4(),
        title: t('not_scheduled'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(ReportStatusEnum.NotScheduled),
              propertyKey: 'ReportStatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('planned'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(ReportStatusEnum.Planned),
              propertyKey: 'ReportStatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: t('unallocated'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: getLabel(ReportStatusEnum.Unallocated),
              propertyKey: 'ReportStatusLabelled',
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
