import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { AppetiteParentInsertInput } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockUniqueCompositeId } from '../services/mockData';
import { thirdPartyIdSchema } from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

type InsertType = AppetiteParentInsertInput;

const schema = z.object({
  parentId: thirdPartyIdSchema,
  parentType: z.nativeEnum(ParentTypeEnum),
  appetiteId: thirdPartyIdSchema,
});

type CsvType = z.infer<typeof schema>;

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    ParentId: c.parentId,
    Id: c.appetiteId,
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
      appetiteId: ids.childId,
      parentId: ids.parentId,
    });
  }

  return records;
};

const sheet: Sheet<'appetiteParents.csv', CsvType, InsertType> = {
  name: 'appetiteParents.csv',
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
      key: 'appetiteId',
      type: 'string',
      foreignKey: ParentTypeEnum.Appetite,
    },
  ],
  constraints: [
    {
      type: 'unique',
      fields: ['appetiteId', 'parentId'],
    },
  ],
  mapToInsert,
  generateMockData,
};

export default sheet;
