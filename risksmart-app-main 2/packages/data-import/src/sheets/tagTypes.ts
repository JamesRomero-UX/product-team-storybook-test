import { z } from 'zod';

import type { TagTypeInsertInput } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockDescription, mockTitle } from '../services/mockData';
import { thirdPartyIdSchema } from '../services/sharedSchemas';
import type { Sheet } from './Sheet';
import { ParentTypePlus } from './types';

export const csvFileName = 'tagTypes.csv';
type InsertType = TagTypeInsertInput;

const schema = z.object({
  tagTypeId: thirdPartyIdSchema,
  name: z.string(),
  description: z.string().nullable(),
});

type CsvType = z.infer<typeof schema>;

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    Description: c.description,
    TagTypeId: c.tagTypeId,
    Name: c.name,
    OrgKey: orgKey,
    CreatedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    ModifiedAtTimestamp: undefined,
    ModifiedByUser: 'SYSTEM',
  };
};

export const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.tagTypeCount; i++) {
    records.push({
      description: mockDescription(),
      tagTypeId: (i + 1).toString(),
      name: mockTitle(),
    });
  }

  return records;
};
const sheet: Sheet<'tagTypes.csv', CsvType, InsertType> = {
  name: 'tagTypes.csv',
  schema,
  objectType: ParentTypePlus.TagType,
  fields: [
    {
      key: 'tagTypeId',
      type: 'string',
      isPrimaryKey: true,
    },
    {
      key: 'name',
      fieldConfigFieldId: 'Name',
      type: 'string',
      unique: true,
    },
    {
      key: 'description',
      fieldConfigFieldId: 'Description',
      type: 'string',
    },
  ],
  generateMockData,
  mapToInsert,
};

export default sheet;
