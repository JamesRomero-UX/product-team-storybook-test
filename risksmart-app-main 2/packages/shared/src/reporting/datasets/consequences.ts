import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getConsequences = () =>
  ({
    hasAccess: () => true,
    objectType: ParentTypes.Consequence,
    label: i18n.format(t('consequence_other'), 'capitalize'),
    customAttributeFormConfigurationParentTypes: [ParentTypes.Consequence],
    fields: {
      ...getAuditColumns(),
      title: {
        dataType: 'text',
        displayType: 'text',
        formConfig: { formId: 'consequence', fieldId: 'Title' },
      },
      id: {
        dataType: 'guid',
        displayType: 'text',
        defaultLabel: t('columns.guid'),
      },
      description: {
        dataType: 'text',
        displayType: 'text',
        formConfig: { formId: 'consequence', fieldId: 'Description' },
      },
      criticality: {
        dataType: 'number',
        displayType: 'rating',
        ratingKey: 'criticality',
        formConfig: { formId: 'consequence', fieldId: 'Criticality' },
      },
      costType: {
        dataType: 'text',
        displayType: 'commonLookup',
        i18nKey: 'consequences.costType',
        formConfig: { formId: 'consequence', fieldId: 'CostType' },
      },
      costValue: {
        dataType: 'number',
        displayType: 'number',
        formConfig: { formId: 'consequence', fieldId: 'CostValue' },
      },
      type: {
        dataType: 'text',
        displayType: 'commonLookup',
        i18nKey: 'consequences.types',
        formConfig: { formId: 'consequence', fieldId: 'Type' },
      },
    },
  }) as const satisfies SharedDataset;
