import { getAttestationRecords as sharedDataset } from '@risksmart-app/shared/reporting/datasets/attestationRecords';

import { createDataset } from './types';

export const getAttestationRecords = (_latest: boolean) => {
  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.attestation_record',
    pk: 'Id',
    parentJoin: {
      pgTable: null,
      parentKeyCol: 'NodeId',
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
      userFriendlyName: {
        pgTable: 'risksmart.user_view_active',
        columnMapping: [{ pk: 'Id', fk: 'UserId' }],
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
      userId: {
        fieldType: 'column',
        pgColumn: 'UserId',
      },
      userFriendlyName: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'userFriendlyName',
        pgColumn: 'FriendlyName',
      },
      active: {
        fieldType: 'column',
        pgColumn: 'Active',
      },
      status: {
        fieldType: 'column',
        pgColumn: 'AttestationStatus',
      },
      attestedAt: {
        fieldType: 'column',
        pgColumn: 'AttestedAt',
      },
      expiresAt: {
        fieldType: 'column',
        pgColumn: 'ExpiresAt',
      },
    },
  });
};
