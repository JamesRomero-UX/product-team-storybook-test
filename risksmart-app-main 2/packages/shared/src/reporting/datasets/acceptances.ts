import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getAcceptances = () =>
  ({
    hasAccess: () => true,
    objectType: ParentTypes.Acceptance,
    label: i18n.format(t('acceptance_other'), 'capitalize'),
    customAttributeFormConfigurationParentTypes: [ParentTypes.Acceptance],
    fields: {
      ...getAuditColumns(),
      title: {
        dataType: 'text',
        displayType: 'text',
        formConfig: { formId: 'acceptance', fieldId: 'Title' },
      },
      details: {
        dataType: 'text',
        displayType: 'text',
        formConfig: { formId: 'acceptance', fieldId: 'Details' },
      },
      id: {
        dataType: 'guid',
        displayType: 'text',
        defaultLabel: t('columns.guid'),
      },
      acceptedFrom: {
        dataType: 'date',
        displayType: 'date',
        formConfig: { formId: 'acceptance', fieldId: 'DateAcceptedFrom' },
      },
      acceptedTo: {
        dataType: 'date',
        displayType: 'date',
        formConfig: { formId: 'acceptance', fieldId: 'DateAcceptedTo' },
      },
      sequentialId: {
        dataType: 'number',
        displayType: 'number',
        defaultLabel: t('columns.id'),
        prefix: 'ACC-',
      },
      status: {
        dataType: 'text',
        displayType: 'rating',
        ratingKey: 'acceptance_status',
        formConfig: { formId: 'acceptance', fieldId: 'Status' },
      },
      detailsLink: {
        dataType: 'guid',
        defaultLabel: t('acceptances.columns.details_link'),
        displayType: 'detailsLink',
        entityInfoParentType: ParentTypes.Acceptance,
      },
    },
  }) as const satisfies SharedDataset;
