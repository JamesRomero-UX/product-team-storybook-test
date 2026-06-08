import { getDocumentVersions as sharedDataset } from '@risksmart-app/shared/reporting/datasets/documentVersions';

import { createDataset } from './types';

export const getDocumentVersions = (_latest: boolean) => {
  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.document_file',
    pk: 'Id',
    parentJoin: {
      pgTable: null,
      parentKeyCol: 'ParentDocumentId',
      idCol: null,
    },
    relations: {
      createdBy: {
        pgTable: 'risksmart.user_view_active',
        columnMapping: [{ pk: 'Id', fk: 'CreatedByUser' }],
      },
      modifiedBy: {
        pgTable: 'risksmart.user_view_active',
        columnMapping: [{ pk: 'Id', fk: 'ModifiedByUser' }],
      },
      reviewedBy: {
        pgTable: 'risksmart.user_view_active',
        columnMapping: [{ pk: 'Id', fk: 'ReviewedBy' }],
      },
    },
    fields: {
      // Audit columns
      createdAtTimestamp: {
        fieldType: 'column',
        pgColumn: 'CreatedAtTimestamp',
      },
      modifiedAtTimestamp: {
        fieldType: 'column',
        pgColumn: 'ModifiedAtTimestamp',
      },
      createdById: {
        fieldType: 'column',
        pgColumn: 'CreatedByUser',
      },
      modifiedById: {
        fieldType: 'column',
        pgColumn: 'ModifiedByUser',
      },
      createdByFriendlyName: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'createdBy',
        pgColumn: 'FriendlyName',
      },
      modifiedByFriendlyName: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'modifiedBy',
        pgColumn: 'FriendlyName',
      },
      // End audit
      id: {
        fieldType: 'column',
        pgColumn: 'Id',
      },
      version: {
        fieldType: 'column',
        pgColumn: 'Version',
      },
      status: {
        fieldType: 'column',
        pgColumn: 'Status',
      },
      link: {
        fieldType: 'column',
        pgColumn: 'Link',
      },
      content: {
        fieldType: 'column',
        pgColumn: 'Content',
      },
      type: {
        fieldType: 'column',
        pgColumn: 'Type',
      },
      summary: {
        fieldType: 'column',
        pgColumn: 'Summary',
      },
      reviewedById: {
        fieldType: 'column',
        pgColumn: 'ReviewedBy',
      },
      reasonForReview: {
        fieldType: 'column',
        pgColumn: 'ReasonForReview',
      },
      reviewedByFriendlyName: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'reviewedBy',
        pgColumn: 'FriendlyName',
      },
      reviewedAtTimestamp: {
        fieldType: 'column',
        pgColumn: 'ReviewDate',
      },
      nextReviewTimestamp: {
        fieldType: 'column',
        pgColumn: 'NextReviewDate',
      },
      publishedTimestamp: {
        fieldType: 'column',
        pgColumn: 'PublishedDate',
      },
    },
  });
};
