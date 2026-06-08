import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getDocuments = () =>
  ({
    hasAccess: () => true,
    objectType: ParentTypes.Document,
    label: i18n.format(t('document_other'), 'capitalize'),
    fields: {
      ...getAuditColumns(),
      id: {
        dataType: 'guid',
        displayType: 'text',
        defaultLabel: t('columns.guid'),
      },
      title: {
        dataType: 'text',
        displayType: 'text',
        formConfig: { formId: 'document', fieldId: 'Title' },
      },
      documentType: {
        dataType: 'text',
        formConfig: { formId: 'document', fieldId: 'DocumentType' },
        displayType: 'commonLookup',
        i18nKey: 'policy.types',
      },
      purpose: {
        dataType: 'text',
        displayType: 'text',
        formConfig: { formId: 'document', fieldId: 'Purpose' },
      },
      sequentialId: {
        dataType: 'number',
        displayType: 'number',
        defaultLabel: t('columns.id'),
        prefix: 'D-',
      },
    },
  }) as const satisfies SharedDataset;
