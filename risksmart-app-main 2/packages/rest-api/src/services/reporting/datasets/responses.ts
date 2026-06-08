import { getResponses as sharedDataset } from '@risksmart-app/shared/reporting/datasets/responses';
import { ParentTypeEnum } from 'generated/graphql';

import { createDataset } from './types';

export const getResponses = (_latest: boolean) => {
  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.responses_view',
    pk: 'Id',
    parentJoinPaths: {
      thirdParty: {
        pgTable: null,
        idCol: null,
        parentKeyCol: 'ThirdPartyId',
        applicableForObjectTypes: [ParentTypeEnum.ThirdParty],
      },
      questionnaireTemplateVersion: {
        pgTable: null,
        idCol: null,
        parentKeyCol: 'QuestionnaireTemplateVersionId',
        applicableForObjectTypes: [ParentTypeEnum.QuestionnaireTemplateVersion],
      },
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
      id: { fieldType: 'column', pgColumn: 'Id' },
      status: { fieldType: 'column', pgColumn: 'Status' },
      userEmail: { fieldType: 'column', pgColumn: 'UserEmail' },
      userId: { fieldType: 'column', pgColumn: 'UserId' },
      startDate: { fieldType: 'column', pgColumn: 'StartDate' },
      expiresAt: { fieldType: 'column', pgColumn: 'ExpiresAt' },
      recallReason: { fieldType: 'column', pgColumn: 'RecallReason' },
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
