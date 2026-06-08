import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getObligations = () =>
  ({
    hasAccess: (isModuleEnabled) => isModuleEnabled('obligation'),
    objectType: ParentTypes.Obligation,
    label: i18n.format(t('obligation_other'), 'capitalize'),
    datasetRelationshipOverrides: {
      obligations: ['parent', 'child'],
    },
    customAttributeFormConfigurationParentTypes: [ParentTypes.Obligation],
    fields: {
      ...getAuditColumns(),
      tags: {
        dataType: 'textArray',
        formConfig: {
          formId: 'obligation',
          fieldId: 'tags',
        },
        displayType: 'badgeList',
      },
      departments: {
        dataType: 'textArray',
        formConfig: {
          formId: 'obligation',
          fieldId: 'departments',
        },
        displayType: 'badgeList',
      },
      owners: {
        dataType: 'textArray',
        formConfig: {
          formId: 'obligation',
          fieldId: 'Owners',
        },
        displayType: 'badgeList',
      },
      contributors: {
        dataType: 'textArray',
        formConfig: {
          formId: 'obligation',
          fieldId: 'Contributors',
        },
        displayType: 'badgeList',
      },

      title: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'obligation',
          fieldId: 'Title',
        },
      },
      id: {
        dataType: 'guid',
        displayType: 'text',
        defaultLabel: t('columns.guid'),
      },
      sequentialId: {
        dataType: 'number',
        displayType: 'number',
        defaultLabel: t('columns.id'),
        prefix: 'O-',
      },
      type: {
        dataType: 'number',
        formConfig: {
          formId: 'obligation',
          fieldId: 'Type',
        },
        displayType: 'commonLookup',
        i18nKey: 'obligations.fields.types',
      },
      adherence: {
        dataType: 'number',
        formConfig: {
          formId: 'obligation',
          fieldId: 'Adherence',
        },
        displayType: 'rating',
        ratingKey: 'adherence',
      },
      details: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'obligation',
          fieldId: 'Description',
        },
      },
      interpretation: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'obligation',
          fieldId: 'Interpretation',
        },
      },
      detailsLink: {
        dataType: 'guid',
        defaultLabel: t('obligations.columns.details_link'),
        displayType: 'detailsLink',
        entityInfoParentType: ParentTypes.Obligation,
      },
    },
  }) as const satisfies SharedDataset;
