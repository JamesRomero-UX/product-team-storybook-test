import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { DepartmentInsertInput } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockUniqueCompositeId } from '../services/mockData';
import { thirdPartyIdSchema } from '../services/sharedSchemas';
import type { Sheet } from './Sheet';
import { ParentTypePlus } from './types';

type InsertType = DepartmentInsertInput;

const schema = z.object({
  parentId: thirdPartyIdSchema,
  parentType: z.nativeEnum(ParentTypeEnum),
  departmentTypeId: thirdPartyIdSchema,
});

type CsvType = z.infer<typeof schema>;

export const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    ParentId: c.parentId,
    DepartmentTypeId: c.departmentTypeId,
    OrgKey: orgKey,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
    type: null,
  };
};

export const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  const generateUniqueIds = mockUniqueCompositeId();

  for (let i = 0; i < generateConfig.departmentsCount; i++) {
    const parentType: ParentTypeEnum = faker.helpers.arrayElement([
      ParentTypeEnum.Risk,
      ParentTypeEnum.Issue,
      ParentTypeEnum.Action,
      ParentTypeEnum.Control,
    ]);

    const ids = generateUniqueIds(ParentTypePlus.DepartmentType, parentType);
    records.push({
      parentType,
      parentId: ids.parentId,
      departmentTypeId: ids.childId,
    });
  }

  return records;
};

const sheet: Sheet<'departments.csv', CsvType, InsertType> = {
  name: 'departments.csv',
  schema,
  fields: [
    {
      key: 'parentId',
      type: 'string',
      keyDependantForeignKey: 'parentType',
    },
    {
      key: 'parentType',
      fieldConfigFieldId: 'ParentType',
      type: 'string',
    },
    {
      key: 'departmentTypeId',
      type: 'string',
      foreignKey: ParentTypePlus.DepartmentType,
    },
  ],
  constraints: [
    {
      type: 'unique',
      fields: ['departmentTypeId', 'parentId'],
    },
  ],
  mapToInsert,
  generateMockData,
};

export default sheet;
