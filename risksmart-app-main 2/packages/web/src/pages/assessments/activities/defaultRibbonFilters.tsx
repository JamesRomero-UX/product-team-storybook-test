import i18n from '@risksmart-app/i18n/src/i18n';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { t: t } = useTranslation(['taxonomy']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'assessmentActivities',
  });
  const { t: tt } = useTranslation(['common'], {
    keyPrefix: 'wizard',
  });

  return useMemo(
    () => [
      {
        id: crypto.randomUUID(),
        title: `All ${i18n.format(t('activity_other'), 'capitalize')}`,
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [],
          operation: 'and',
        },
      },
      {
        id: crypto.randomUUID(),
        title: `${i18n.format(st('status.inprogress'), 'capitalizeAll')} ${i18n.format(t('activity_other'), 'capitalize')}`,
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '=',
              propertyKey: 'StatusLabelled',
              value: st('status.inprogress'),
            },
          ],
          operation: 'and',
        },
      },
      {
        id: crypto.randomUUID(),
        title: `${i18n.format(st('status.complete'), 'capitalize')} ${i18n.format(t('activity_other'), 'capitalize')}`,
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '=',
              propertyKey: 'StatusLabelled',
              value: st('status.complete'),
            },
          ],
          operation: 'and',
        },
      },
      {
        id: crypto.randomUUID(),
        title: `${i18n.format(st('status.notstarted'), 'capitalizeAll')} ${tt('wizardName')}`,
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '=',
              propertyKey: 'StatusLabelled',
              value: st('status.notstarted'),
            },
            {
              operator: '=',
              propertyKey: 'ActivityTypeLabelled',
              value: tt('wizardName'),
            },
          ],
          operation: 'and',
        },
      },
    ],
    [t, st, tt]
  );
};
