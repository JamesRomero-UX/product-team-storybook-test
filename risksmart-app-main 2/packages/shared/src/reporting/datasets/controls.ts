import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getControls = () =>
  ({
    hasAccess: () => true,
    objectType: ParentTypes.Control,
    label: i18n.format(t('control_other'), 'capitalize'),
    customAttributeFormConfigurationParentTypes: [ParentTypes.Control],
    fields: {
      ...getAuditColumns(),
      tags: {
        dataType: 'textArray',
        formConfig: {
          formId: 'control',
          fieldId: 'tags',
        },
        displayType: 'badgeList',
      },
      departments: {
        dataType: 'textArray',
        formConfig: {
          formId: 'control',
          fieldId: 'departments',
        },
        displayType: 'badgeList',
      },
      owners: {
        dataType: 'textArray',
        formConfig: {
          formId: 'control',
          fieldId: 'Owners',
        },
        displayType: 'badgeList',
      },
      contributors: {
        dataType: 'textArray',
        formConfig: {
          formId: 'control',
          fieldId: 'Contributors',
        },
        displayType: 'badgeList',
      },
      ratingFrequency: {
        dataType: 'text',
        defaultLabel: t('controls.columns.test_frequency'),
        displayType: 'commonLookup',
        i18nKey: 'frequency',
      },
      latestRatingDate: {
        dataType: 'date',
        defaultLabel: t('controls.columns.latest_rating_date'),
        displayType: 'date',
      },
      nextRatingDueDate: {
        dataType: 'date',
        defaultLabel: t('controls.columns.next_test_date'),
        displayType: 'date',
      },
      nextRatingOverdueDate: {
        dataType: 'date',
        defaultLabel: t('controls.columns.nextTestOverdue'),
        displayType: 'date',
      },
      title: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'control',
          fieldId: 'Title',
        },
      },
      description: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'control',
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
        prefix: 'C-',
      },
      detailsLink: {
        dataType: 'guid',
        defaultLabel: t('controls.columns.details_link'),
        displayType: 'detailsLink',
        entityInfoParentType: ParentTypes.Control,
      },
      controlType: {
        dataType: 'text',
        formConfig: {
          formId: 'control',
          fieldId: 'Type',
        },
        displayType: 'commonLookup',
        i18nKey: 'controls.type',
      },
    },
  }) as const satisfies SharedDataset;
