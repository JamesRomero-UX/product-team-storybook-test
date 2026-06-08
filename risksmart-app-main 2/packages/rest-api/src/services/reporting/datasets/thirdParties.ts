import { getThirdParties as sharedDataset } from '@risksmart-app/shared/reporting/datasets/thirdParties';

import { createDataset } from './types';

export const getThirdParties = (_latest: boolean) => {
  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.third_party',
    pk: 'Id',
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
      sequentialId: { fieldType: 'column', pgColumn: 'SequentialId' },
      title: { fieldType: 'column', pgColumn: 'Title' },
      description: { fieldType: 'column', pgColumn: 'Description' },
      companyName: { fieldType: 'column', pgColumn: 'CompanyName' },
      address: { fieldType: 'column', pgColumn: 'Address' },
      cityTown: { fieldType: 'column', pgColumn: 'CityTown' },
      postcode: { fieldType: 'column', pgColumn: 'Postcode' },
      country: { fieldType: 'column', pgColumn: 'Country' },
      primaryContactName: {
        fieldType: 'column',
        pgColumn: 'PrimaryContactName',
      },
      contactName: { fieldType: 'column', pgColumn: 'ContactName' },
      contactEmail: { fieldType: 'column', pgColumn: 'ContactEmail' },
      companyDomain: { fieldType: 'column', pgColumn: 'CompanyDomain' },
      companiesHouseNumber: {
        fieldType: 'column',
        pgColumn: 'CompaniesHouseNumber',
      },
      type: { fieldType: 'column', pgColumn: 'Type' },
      status: { fieldType: 'column', pgColumn: 'Status' },
      criticality: { fieldType: 'column', pgColumn: 'Criticality' },
      owners: { fieldType: 'inlineArrayJoin', type: 'ownerUsersAndGroups' },
      contributors: {
        fieldType: 'inlineArrayJoin',
        type: 'contributorUsersAndGroups',
      },
      tags: { fieldType: 'inlineArrayJoin', type: 'tags' },
      departments: { fieldType: 'inlineArrayJoin', type: 'departments' },
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
