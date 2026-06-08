import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { ControlParentInsertInput } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockUniqueCompositeId } from '../services/mockData';
import { thirdPartyIdSchema } from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

type InsertType = ControlParentInsertInput;

const schema = z.object({
  parentId: thirdPartyIdSchema,
  parentType: z.nativeEnum(ParentTypeEnum),
  controlId: thirdPartyIdSchema,
});

type CsvType = z.infer<typeof schema>;

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    ParentId: c.parentId,
    ControlId: c.controlId,
    OrgKey: orgKey,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
  };
};

export const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  const generateUniqueIds = mockUniqueCompositeId();

  for (let i = 1; i <= generateConfig.controlParentsCount; i++) {
    const parentType: ParentTypeEnum = faker.helpers.arrayElement([
      ParentTypeEnum.Risk,
      ParentTypeEnum.Issue,
      ParentTypeEnum.Obligation,
      ParentTypeEnum.Control,
    ]);
    const ids = generateUniqueIds(ParentTypeEnum.Control, parentType);
    records.push({
      parentType: parentType,
      controlId: ids.childId,
      parentId: ids.parentId,
    });
  }

  return records;
};

const sheet: Sheet<'controlParents.csv', CsvType, InsertType> = {
  name: 'controlParents.csv',
  schema,
  fields: [
    {
      key: 'parentId',
      type: 'string',
      keyDependantForeignKey: 'parentType',
    },
    {
      key: 'parentType',
      type: 'string',
    },
    {
      key: 'controlId',
      type: 'string',
      foreignKey: ParentTypeEnum.Control,
    },
  ],
  constraints: [
    {
      type: 'unique',
      fields: ['controlId', 'parentId'],
    },
  ],
  mapToInsert,
  generateMockData,
};

export default sheet;
