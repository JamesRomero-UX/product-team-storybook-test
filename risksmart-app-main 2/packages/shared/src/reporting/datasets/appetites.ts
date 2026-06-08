import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getAppetites = () =>
  ({
    hasAccess: () => true,
    objectType: ParentTypes.Appetite,
    label: i18n.format(t('appetite_other'), 'capitalize'),
    customAttributeFormConfigurationParentTypes: [ParentTypes.Appetite],
    fields: {
      ...getAuditColumns(),
      statement: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'appetite',
          fieldId: 'Statement',
        },
      },
      id: {
        dataType: 'guid',
        displayType: 'text',
        defaultLabel: t('columns.guid'),
      },
      effectiveDate: {
        dataType: 'date',
        displayType: 'date',
        formConfig: {
          formId: 'appetite',
          fieldId: 'EffectiveDate',
        },
      },
      lowerAppetite: {
        dataType: 'number',
        displayType: 'rating',
        ratingKey: 'risk_appetite',
        formConfig: {
          formId: 'appetite',
          fieldId: 'LowerAppetite',
        },
      },
      upperAppetite: {
        dataType: 'number',
        displayType: 'rating',
        ratingKey: 'risk_appetite',
        formConfig: {
          formId: 'appetite',
          fieldId: 'UpperAppetite',
        },
      },
      sequentialId: {
        dataType: 'number',
        displayType: 'number',
        defaultLabel: t('columns.id'),
        prefix: 'APT-',
      },
      status: {
        dataType: 'text',
        displayType: 'rating',
        ratingKey: 'appetite_status',
        defaultLabel: t('appetites.columns.status'),
        onlyShowIfChild: true,
      },
      type: {
        dataType: 'text',
        displayType: 'commonLookup',
        i18nKey: 'appetiteTypes',
        defaultLabel: t('appetites.columns.appetiteType'),
      },
      detailsLink: {
        dataType: 'guid',
        defaultLabel: t('appetites.columns.details_link'),
        displayType: 'detailsLink',
        entityInfoParentType: ParentTypes.Appetite,
      },
    },
  }) as const satisfies SharedDataset;
