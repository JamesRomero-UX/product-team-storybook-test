import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getIndicators = () =>
  ({
    hasAccess: () => true,
    objectType: ParentTypes.Indicator,
    label: i18n.format(t('indicator_other'), 'capitalize'),
    customAttributeFormConfigurationParentTypes: [ParentTypes.Indicator],
    fields: {
      ...getAuditColumns(),
      tags: {
        dataType: 'textArray',
        formConfig: {
          formId: 'indicator',
          fieldId: 'tags',
        },
        displayType: 'badgeList',
      },
      departments: {
        dataType: 'textArray',
        formConfig: {
          formId: 'indicator',
          fieldId: 'departments',
        },
        displayType: 'badgeList',
      },
      owners: {
        dataType: 'textArray',
        formConfig: {
          formId: 'indicator',
          fieldId: 'Owners',
        },
        displayType: 'badgeList',
      },
      contributors: {
        dataType: 'textArray',
        formConfig: {
          formId: 'indicator',
          fieldId: 'Contributors',
        },
        displayType: 'badgeList',
      },
      ratingFrequency: {
        dataType: 'text',
        defaultLabel: t('indicators.columns.test_frequency'),
        displayType: 'commonLookup',
        i18nKey: 'frequency',
      },
      latestRatingDate: {
        dataType: 'date',
        defaultLabel: t('indicators.columns.latest_result_date'),
        displayType: 'date',
      },
      nextRatingDueDate: {
        dataType: 'date',
        defaultLabel: t('indicators.columns.nextTestDate'),
        displayType: 'date',
      },
      nextRatingOverdueDate: {
        dataType: 'date',
        defaultLabel: t('indicators.columns.nextTestOverdue'),
        displayType: 'date',
      },
      name: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'indicator',
          fieldId: 'Title',
        },
      },
      details: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'indicator',
          fieldId: 'Description',
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
        prefix: 'IN-',
      },
      lowerTolerance: {
        dataType: 'number',
        displayType: 'number',
        formConfig: {
          formId: 'indicator',
          fieldId: 'LowerToleranceNum',
        },
      },
      lowerAppetite: {
        dataType: 'number',
        displayType: 'number',
        formConfig: {
          formId: 'indicator',
          fieldId: 'LowerAppetiteNum',
        },
      },
      upperAppetite: {
        dataType: 'number',
        displayType: 'number',
        formConfig: {
          formId: 'indicator',
          fieldId: 'UpperAppetiteNum',
        },
      },
      upperTolerance: {
        dataType: 'number',
        displayType: 'number',
        formConfig: {
          formId: 'indicator',
          fieldId: 'UpperToleranceNum',
        },
      },
      type: {
        dataType: 'text',
        formConfig: {
          formId: 'indicator',
          fieldId: 'Type',
        },
        displayType: 'rating',
        ratingKey: 'indicator_type',
      },
      unit: {
        dataType: 'text',
        formConfig: {
          formId: 'indicator',
          fieldId: 'Unit',
        },
        displayType: 'text',
      },
      expectedTextValue: {
        dataType: 'text',
        formConfig: {
          formId: 'indicator',
          fieldId: 'TargetValueTxt',
        },
        displayType: 'text',
      },
      detailsLink: {
        dataType: 'guid',
        defaultLabel: t('indicators.columns.details_link'),
        displayType: 'detailsLink',
        entityInfoParentType: ParentTypes.Indicator,
      },
    },
  }) as const satisfies SharedDataset;
