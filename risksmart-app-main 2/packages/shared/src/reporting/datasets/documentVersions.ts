import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getDocumentVersions = () =>
  ({
    hasAccess: () => true,
    objectType: ParentTypes.DocumentFile,
    label: i18n.format(t('document_file_other'), 'capitalize'),
    fields: {
      ...getAuditColumns(),
      id: {
        dataType: 'guid',
        displayType: 'text',
        defaultLabel: t('columns.guid'),
      },
      version: {
        dataType: 'text',
        displayType: 'text',
        formConfig: { formId: 'document_file', fieldId: 'Version' },
      },
      summary: {
        dataType: 'text',
        displayType: 'text',
        formConfig: { formId: 'document_file', fieldId: 'Summary' },
      },
      status: {
        dataType: 'text',
        formConfig: { formId: 'document_file', fieldId: 'Status' },
        displayType: 'rating',
        ratingKey: 'document_file_status',
      },
      reasonForReview: {
        dataType: 'text',
        displayType: 'text',
        formConfig: { formId: 'document_file', fieldId: 'ReasonForReview' },
      },
      reviewedById: {
        dataType: 'text',
        displayType: 'text',
        defaultLabel: t('documentFiles.columns.reviewedById'),
      },
      reviewedByFriendlyName: {
        dataType: 'text',
        displayType: 'text',
        formConfig: { formId: 'document_file', fieldId: 'ReviewedBy' },
      },
      reviewedAtTimestamp: {
        dataType: 'date',
        displayType: 'date',
        formConfig: { formId: 'document_file', fieldId: 'ReviewDate' },
      },
      nextReviewTimestamp: {
        dataType: 'date',
        displayType: 'date',
        formConfig: { formId: 'document_file', fieldId: 'NextReviewDate' },
      },
      type: {
        dataType: 'text',
        formConfig: { formId: 'document_file', fieldId: 'Type' },
        displayType: 'rating',
        ratingKey: 'document_file_type',
      },
      content: {
        dataType: 'text',
        displayType: 'text',
        formConfig: { formId: 'document_file', fieldId: 'Content' },
      },
      link: {
        dataType: 'text',
        displayType: 'text',
        formConfig: { formId: 'document_file', fieldId: 'Link' },
      },
      publishedTimestamp: {
        dataType: 'date',
        displayType: 'date',
        defaultLabel: t('documentFiles.columns.publishDate'),
      },
    },
  }) as const satisfies SharedDataset;
