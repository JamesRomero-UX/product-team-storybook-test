import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getActions = () =>
  ({
    hasAccess: () => true,
    objectType: ParentTypes.Action,
    label: i18n.format(t('action_other'), 'capitalize'),
    customAttributeFormConfigurationParentTypes: [ParentTypes.Action],
    fields: {
      ...getAuditColumns(),
      tags: {
        dataType: 'textArray',
        formConfig: {
          formId: 'action',
          fieldId: 'tags',
        },
        displayType: 'badgeList',
      },
      departments: {
        dataType: 'textArray',
        formConfig: {
          formId: 'action',
          fieldId: 'departments',
        },
        displayType: 'badgeList',
      },
      owners: {
        dataType: 'textArray',
        formConfig: {
          formId: 'action',
          fieldId: 'Owners',
        },
        displayType: 'badgeList',
      },
      contributors: {
        dataType: 'textArray',
        formConfig: {
          formId: 'action',
          fieldId: 'Contributors',
        },
        displayType: 'badgeList',
      },
      title: {
        formConfig: {
          formId: 'action',
          fieldId: 'Title',
        },
        dataType: 'text',
        displayType: 'text',
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
        prefix: 'A-',
      },
      closedDate: {
        formConfig: {
          formId: 'action',
          fieldId: 'ClosedDate',
        },
        dataType: 'date',
        displayType: 'date',
      },
      dateRaised: {
        formConfig: {
          formId: 'action',
          fieldId: 'DateRaised',
        },
        dataType: 'date',
        displayType: 'date',
      },
      dateDue: {
        formConfig: {
          formId: 'action',
          fieldId: 'DateDue',
        },
        dataType: 'date',
        displayType: 'date',
      },
      priority: {
        formConfig: {
          formId: 'action',
          fieldId: 'Priority',
        },
        dataType: 'number',
        displayType: 'rating',
        ratingKey: 'priority',
      },
      detailsLink: {
        dataType: 'guid',
        defaultLabel: t('actions.columns.details_link'),
        displayType: 'detailsLink',
        entityInfoParentType: ParentTypes.Action,
      },
      description: {
        formConfig: {
          formId: 'action',
          fieldId: 'Description',
        },
        dataType: 'text',
        displayType: 'text',
      },
      status: {
        formConfig: {
          formId: 'action',
          fieldId: 'Status',
        },
        dataType: 'text',
        displayType: 'rating',
        ratingKey: 'action_status',
      },
    },
  }) as const satisfies SharedDataset;
