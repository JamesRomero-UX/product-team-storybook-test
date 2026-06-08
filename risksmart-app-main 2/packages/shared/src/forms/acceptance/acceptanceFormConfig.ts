import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getAcceptanceFormConfig = () => {
  return {
    Title: {
      fieldId: 'Title',
      formLabel: i18n.t(`acceptances.fields.Title`),
      columnHeader: i18n.t(`acceptances.columns.title`),
      allowAsConditionSource: true,
    },
    DateAcceptedFrom: {
      fieldId: 'DateAcceptedFrom',
      formLabel: i18n.t(`acceptances.fields.DateAcceptedFrom`),
      columnHeader: i18n.t(`acceptances.columns.accepted_from`),
      displayType: { displayType: 'date' },
      allowAsConditionSource: true,
    },
    DateAcceptedTo: {
      fieldId: 'DateAcceptedTo',
      formLabel: i18n.t(`acceptances.fields.DateAcceptedTo`),
      columnHeader: i18n.t(`acceptances.columns.accepted_to`),
      displayType: { displayType: 'date' },
      allowAsConditionSource: true,
    },
    requestedBy: {
      fieldId: 'requestedBy',
      formLabel: i18n.t(`acceptances.fields.requestedBy`),
      columnHeader: i18n.t(`columns.requested_by`),
    },
    approvedBy: {
      fieldId: 'approvedBy',
      formLabel: i18n.t(`acceptances.fields.approvedBy`),
      columnHeader: i18n.t(`columns.approved_by`),
    },
    Status: {
      fieldId: 'Status',
      formLabel: i18n.t(`acceptances.fields.Status`),
      columnHeader: i18n.t(`acceptances.columns.status`),
      allowAsConditionSource: true,
      displayType: { displayType: 'rating', ratingKey: 'acceptance_status' },
    },
    Details: {
      fieldId: 'Details',
      formLabel: i18n.t(`acceptances.fields.Details`),
      columnHeader: i18n.t(`acceptances.columns.details`),
      allowTargetConditions: true,
    },
    files: {
      fieldId: 'files',
      formLabel: i18n.t(`fields.newFiles`),
      allowTargetConditions: true,
    },
  } as const satisfies FormConfig;
};
