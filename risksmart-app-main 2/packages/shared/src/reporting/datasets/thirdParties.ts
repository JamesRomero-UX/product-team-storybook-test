import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getThirdParties = () =>
  ({
    hasAccess: () => true,
    objectType: ParentTypes.ThirdParty,
    label: i18n.format(t('third_party_other'), 'capitalize'),
    customAttributeFormConfigurationParentTypes: [ParentTypes.ThirdParty],
    fields: {
      id: {
        dataType: 'guid',
        displayType: 'text',
        defaultLabel: t('columns.guid'),
      },
      sequentialId: {
        dataType: 'number',
        displayType: 'number',
        defaultLabel: t('columns.id'),
        prefix: 'TP-',
      },
      title: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'third_party',
          fieldId: 'title',
        },
      },
      description: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'third_party',
          fieldId: 'description',
        },
      },
      companyName: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'third_party',
          fieldId: 'companyName',
        },
      },
      companiesHouseNumber: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'third_party',
          fieldId: 'companiesHouseNumber',
        },
      },
      address: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'third_party',
          fieldId: 'address',
        },
      },
      cityTown: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'third_party',
          fieldId: 'cityTown',
        },
      },
      postcode: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'third_party',
          fieldId: 'postcode',
        },
      },
      country: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'third_party',
          fieldId: 'country',
        },
      },
      primaryContactName: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'third_party',
          fieldId: 'primaryContactName',
        },
      },
      contactName: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'third_party',
          fieldId: 'contactName',
        },
      },
      contactEmail: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'third_party',
          fieldId: 'contactEmail',
        },
      },
      companyDomain: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'third_party',
          fieldId: 'companyDomain',
        },
      },
      type: {
        dataType: 'text',
        displayType: 'rating',
        ratingKey: 'third_party_type',
        formConfig: {
          formId: 'third_party',
          fieldId: 'type',
        },
      },
      status: {
        dataType: 'text',
        displayType: 'rating',
        ratingKey: 'third_party_status',
        formConfig: {
          formId: 'third_party',
          fieldId: 'status',
        },
      },
      criticality: {
        dataType: 'number',
        displayType: 'rating',
        ratingKey: 'third_party_criticality',
        formConfig: {
          formId: 'third_party',
          fieldId: 'criticality',
        },
      },
      owners: {
        dataType: 'textArray',
        displayType: 'badgeList',
        formConfig: {
          formId: 'third_party',
          fieldId: 'Owners',
        },
      },
      contributors: {
        dataType: 'textArray',
        displayType: 'badgeList',
        formConfig: {
          formId: 'third_party',
          fieldId: 'Contributors',
        },
      },
      tags: {
        dataType: 'textArray',
        displayType: 'badgeList',
        formConfig: {
          formId: 'third_party',
          fieldId: 'tags',
        },
      },
      departments: {
        dataType: 'textArray',
        displayType: 'badgeList',
        formConfig: {
          formId: 'third_party',
          fieldId: 'departments',
        },
      },
      ...getAuditColumns(),
    },
  }) as const satisfies SharedDataset;
