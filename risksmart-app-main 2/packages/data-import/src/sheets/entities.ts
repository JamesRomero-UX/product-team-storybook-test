import { z } from 'zod';

import type { EntityInsertInput, EntityUpdates } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import {
  nullableThirdPartyIdSchema,
  thirdPartyIdSchema,
} from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

const schema = z.object({
  id: thirdPartyIdSchema,
  name: z.string(),
  description: z.string().nullable(),
  parentEntityId: nullableThirdPartyIdSchema,
});

type CsvType = z.infer<typeof schema>;
type InsertType = EntityInsertInput;
type UpdateType = EntityUpdates;

const generateMockData = () => {
  const records: CsvType[] = [];

  return records;
};

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    Name: c.name,
    Description: c.description,
    Id: c.id,
    OrgKey: orgKey,
    ParentId: c.parentEntityId,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
  };
};

const mapToUpdate = (c: CsvType, orgKey: string): UpdateType => {
  return {
    where: { Id: { _eq: c.id } },
    _set: {
      Name: c.name,
      Description: c.description,
      OrgKey: orgKey,
      ParentId: c.parentEntityId,
      CreatedAtTimestamp: undefined,
      ModifiedAtTimestamp: undefined,
      CreatedByUser: 'SYSTEM',
      ModifiedByUser: 'SYSTEM',
    },
  };
};

export const sheet: Sheet<'entities.csv', CsvType, InsertType, UpdateType> = {
  name: 'entities.csv',
  customAttributeType: ParentTypeEnum.Entity,
  schema,
  objectType: ParentTypeEnum.Entity,
  fields: [
    {
      key: 'id',
      type: 'string',
      isPrimaryKey: true,
    },
    {
      key: 'name',
      fieldConfigFieldId: 'Name',
      type: 'string',
    },
    {
      key: 'description',
      fieldConfigFieldId: 'Description',
      type: 'string',
    },
    {
      key: 'parentEntityId',
      type: 'string',
      foreignKey: ParentTypeEnum.Entity,
    },
  ],
  generateMockData,
  mapToInsert,
  mapToUpdate,
};
export default sheet;
