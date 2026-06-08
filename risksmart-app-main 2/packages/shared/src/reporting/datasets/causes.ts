import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getCauses = () =>
  ({
    hasAccess: () => true,
    objectType: ParentTypes.Cause,
    label: i18n.format(t('cause_other'), 'capitalize'),
    customAttributeFormConfigurationParentTypes: [ParentTypes.Cause],
    fields: {
      ...getAuditColumns(),
      title: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'cause',
          fieldId: 'Title',
        },
      },
      id: {
        dataType: 'guid',
        displayType: 'text',
        defaultLabel: t('columns.guid'),
      },
      description: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'cause',
          fieldId: 'Description',
        },
      },
      significance: {
        dataType: 'number',
        displayType: 'rating',
        ratingKey: 'significance',
        formConfig: {
          formId: 'cause',
          fieldId: 'Significance',
        },
      },
    },
  }) as const satisfies SharedDataset;
