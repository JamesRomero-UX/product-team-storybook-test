import { createLateralJoinArrayFieldQueryInfo } from './types';

export const tagsQueryInfo = createLateralJoinArrayFieldQueryInfo({
  objectTable: 'risksmart.tag_type',
  manyToManyTable: 'risksmart.tag',
  objectTableJoinCol: 'Id',
  manyToManyJoinCol: 'TagTypeId',
  objectTableQueryCol: 'Name',
  manyToManyPk: 'ParentId',
});
