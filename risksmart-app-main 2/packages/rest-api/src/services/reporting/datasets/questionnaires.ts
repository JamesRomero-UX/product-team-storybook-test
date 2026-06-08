import { getQuestionnaires as sharedDataset } from '@risksmart-app/shared/reporting/datasets/questionnaires';

import { createDataset } from './types';

export const getQuestionnaires = (_latest: boolean) => {
  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.questionnaires_view',
    pk: 'Id',
    parentJoin: {
      pgTable: null,
      idCol: null,
      parentKeyCol: 'ParentId',
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
    },
    fields: {
      id: { fieldType: 'column', pgColumn: 'TemplateId' },
      title: { fieldType: 'column', pgColumn: 'Title' },
      description: { fieldType: 'column', pgColumn: 'Description' },
      version: { fieldType: 'column', pgColumn: 'Version' },
      status: { fieldType: 'column', pgColumn: 'Status' },
      owners: {
        fieldType: 'inlineArrayJoin',
        type: 'ownerUsersAndGroups',
        idColumn: 'TemplateId',
      },
      contributors: {
        fieldType: 'inlineArrayJoin',
        type: 'contributorUsersAndGroups',
        idColumn: 'TemplateId',
      },
      tags: {
        fieldType: 'inlineArrayJoin',
        type: 'tags',
        idColumn: 'TemplateId',
      },
      departments: {
        fieldType: 'inlineArrayJoin',
        type: 'departments',
        idColumn: 'TemplateId',
      },
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
    },
  });
};
