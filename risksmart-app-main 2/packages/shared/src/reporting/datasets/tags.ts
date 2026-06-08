import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import type { SharedDataset } from './types';

export const getTags = () =>
  ({
    hasAccess: () => true,
    label: i18n.format(t('tag_other'), 'capitalize'),
    disabled: true,
    fields: {
      id: {
        dataType: 'guid',
        displayType: 'text',
        defaultLabel: t('columns.id'),
      },
      name: {
        dataType: 'text',
        displayType: 'text',
        defaultLabel: t('tags.columns.name'),
      },
    },
  }) as const satisfies SharedDataset;
