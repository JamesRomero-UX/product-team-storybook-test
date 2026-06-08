import { getTags as sharedDataset } from '@risksmart-app/shared/reporting/datasets/tags';

import { createDataset } from './types';

export const getTags = (_latest: boolean) => {
  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.tag_type',
    parentJoin: {
      pgTable: 'risksmart.tag',
      idCol: 'TagTypeId',
      parentKeyCol: 'ParentId',
    },

    pk: 'Id',
    fields: {
      name: {
        fieldType: 'column',
        pgColumn: 'Name',
      },
      id: { fieldType: 'column', pgColumn: 'Id' },
    },
  });
};
