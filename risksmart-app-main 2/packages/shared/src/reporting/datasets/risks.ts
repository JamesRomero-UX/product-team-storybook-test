import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getRisks = () =>
  ({
    hasAccess: () => true,
    objectType: ParentTypes.Risk,
    label: i18n.format(t('risk_other'), 'capitalize'),
    datasetRelationshipOverrides: {
      risks: ['parent', 'child'],
    },
    customAttributeFormConfigurationParentTypes: [ParentTypes.Risk],
    fields: {
      ...getAuditColumns(),
      tags: {
        dataType: 'textArray',
        formConfig: {
          formId: 'risk',
          fieldId: 'tags',
        },
        displayType: 'badgeList',
      },
      departments: {
        dataType: 'textArray',
        formConfig: {
          formId: 'risk',
          fieldId: 'departments',
        },
        displayType: 'badgeList',
      },
      owners: {
        dataType: 'textArray',
        formConfig: {
          formId: 'risk',
          fieldId: 'Owners',
        },
        displayType: 'badgeList',
      },
      contributors: {
        dataType: 'textArray',
        formConfig: {
          formId: 'risk',
          fieldId: 'Contributors',
        },
        displayType: 'badgeList',
      },
      ratingFrequency: {
        dataType: 'text',
        defaultLabel: t('risks.columns.test_frequency'),
        displayType: 'commonLookup',
        i18nKey: 'frequency',
      },
      latestRatingDate: {
        dataType: 'date',
        defaultLabel: t('risks.columns.latest_rating_date'),
        displayType: 'date',
      },
      nextRatingDueDate: {
        dataType: 'date',
        defaultLabel: t('risks.columns.next_test_date'),
        displayType: 'date',
      },
      nextRatingOverdueDate: {
        dataType: 'date',
        defaultLabel: t('risks.columns.nextTestOverdue'),
        displayType: 'date',
      },
      title: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'risk',
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
        prefix: 'R-',
      },
      tier: {
        dataType: 'number',
        formConfig: {
          formId: 'risk',
          fieldId: 'Tier',
        },
        displayType: 'commonLookup',
        i18nKey: 'tiers',
      },
      treatment: {
        dataType: 'text',
        formConfig: {
          formId: 'risk',
          fieldId: 'Treatment',
        },
        displayType: 'commonLookup',
        i18nKey: 'treatments',
      },
      status: {
        dataType: 'text',
        formConfig: {
          formId: 'risk',
          fieldId: 'Status',
        },
        displayType: 'commonLookup',
        i18nKey: 'statuses',
      },
      inherentRating: {
        dataType: 'number',
        defaultLabel: t('risks.columns.uncontrolled_rating'),
        displayType: 'rating',
        ratingKey: 'risk_uncontrolled',
      },
      residualRating: {
        dataType: 'number',
        defaultLabel: t('risks.columns.controlled_rating'),
        displayType: 'rating',
        ratingKey: 'risk_controlled',
      },
      inherentScore: {
        dataType: 'number',
        defaultLabel: t('risks.columns.uncontrolled_score'),
        displayType: 'number',
      },
      residualScore: {
        dataType: 'number',
        defaultLabel: t('risks.columns.controlled_score'),
        displayType: 'number',
      },
      detailsLink: {
        dataType: 'guid',
        defaultLabel: t('risks.columns.details_link'),
        displayType: 'detailsLink',
        entityInfoParentType: ParentTypes.Risk,
      },
      details: {
        formConfig: {
          formId: 'risk',
          fieldId: 'Description',
        },
        dataType: 'text',
        displayType: 'text',
      },
    },
  }) as const satisfies SharedDataset;
