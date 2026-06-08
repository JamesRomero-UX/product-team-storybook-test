import { z } from 'zod';

import type { DepartmentTypeInsertInput } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockDescription, mockTitle } from '../services/mockData';
import { thirdPartyIdSchema } from '../services/sharedSchemas';
import type { Sheet } from './Sheet';
import { ParentTypePlus } from './types';

type InsertType = DepartmentTypeInsertInput;

const schema = z.object({
  departmentTypeId: thirdPartyIdSchema,
  name: z.string(),
  description: z.string().nullable(),
});

type CsvType = z.infer<typeof schema>;

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    Description: c.description,
    DepartmentTypeId: c.departmentTypeId,
    Name: c.name,
    OrgKey: orgKey,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
  };
};

export const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.departmentTypeCount; i++) {
    records.push({
      description: mockDescription(),
      departmentTypeId: (i + 1).toString(),
      name: mockTitle(),
    });
  }

  return records;
};

const sheet: Sheet<'departmentTypes.csv', CsvType, InsertType> = {
  name: 'departmentTypes.csv',
  schema,
  objectType: ParentTypePlus.DepartmentType,
  fields: [
    {
      key: 'departmentTypeId',
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
