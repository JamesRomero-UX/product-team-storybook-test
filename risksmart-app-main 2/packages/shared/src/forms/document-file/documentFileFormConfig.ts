import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getDocumentFileFormConfig = () => {
  return {
    Version: {
      fieldId: 'Version',
      formLabel: i18n.t('documentFiles.fields.Version'),
      columnHeader: i18n.t('documentFiles.columns.version'),
      allowAsConditionSource: true,
    },
    Status: {
      fieldId: 'Status',
      formLabel: i18n.t('documentFiles.fields.Status'),
      columnHeader: i18n.t('documentFiles.columns.status'),
      allowAsConditionSource: true,
      displayType: { displayType: 'rating', ratingKey: 'document_file_status' },
    },
    Summary: {
      fieldId: 'Summary',
      formLabel: i18n.t('documentFiles.fields.Summary'),
      columnHeader: i18n.t('documentFiles.columns.summary'),
      allowTargetConditions: true,
    },
    Type: {
      fieldId: 'Type',
      formLabel: i18n.t('documentFiles.fields.Type'),
      columnHeader: i18n.t('documentFiles.columns.type'),
      allowAsConditionSource: true,
      displayType: { displayType: 'rating', ratingKey: 'document_file_type' },
    },
    Content: {
      fieldId: 'Content',
      formLabel: i18n.t('documentFiles.fields.Text'),
      columnHeader: i18n.t('documentFiles.columns.content'),
    },
    Link: {
      fieldId: 'Link',
      formLabel: i18n.t('documentFiles.fields.Link'),
      columnHeader: i18n.t('documentFiles.columns.link'),
    },
    files: {
      fieldId: 'files',
      formLabel: i18n.t('documentFiles.fields.newFile'),
    },
    ReasonForReview: {
      fieldId: 'ReasonForReview',
      formLabel: i18n.t('documentFiles.fields.ReasonForReview'),
      columnHeader: i18n.t('documentFiles.columns.reviewReason'),
    },
    ReviewedBy: {
      fieldId: 'ReviewedBy',
      formLabel: i18n.t('documentFiles.fields.ReviewedBy'),
      columnHeader: i18n.t('documentFiles.columns.reviewedBy'),
      displayType: { displayType: 'users', multiple: false },
    },
    ReviewDate: {
      fieldId: 'ReviewDate',
      formLabel: i18n.t('documentFiles.fields.ReviewDate'),
      columnHeader: i18n.t('documentFiles.columns.reviewDate'),
      displayType: { displayType: 'date' },
    },
    NextReviewDate: {
      fieldId: 'NextReviewDate',
      formLabel: i18n.t('documentFiles.fields.NextReviewDate'),
      columnHeader: i18n.t('documentFiles.columns.reviewDue'),
      displayType: { displayType: 'date' },
    },
  } as const satisfies FormConfig;
};
