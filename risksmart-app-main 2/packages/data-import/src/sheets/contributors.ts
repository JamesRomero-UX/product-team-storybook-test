import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { ContributorInsertInput } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockUniqueCompositeId } from '../services/mockData';
import { thirdPartyIdSchema } from '../services/sharedSchemas';
import type { Sheet } from './Sheet';
import { ParentTypePlus } from './types';

type InsertType = ContributorInsertInput;

const schema = z.object({
  parentId: thirdPartyIdSchema,
  ownerId: thirdPartyIdSchema,
  parentType: z.nativeEnum(ParentTypeEnum),
});

type CsvType = z.infer<typeof schema>;

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    ParentId: c.parentId,
    UserId: c.ownerId,
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

  for (let i = 1; i <= generateConfig.contributorsCount; i++) {
    const parentType: ParentTypeEnum = faker.helpers.arrayElement([
      ParentTypeEnum.Risk,
      ParentTypeEnum.Issue,
      ParentTypeEnum.Obligation,
      ParentTypeEnum.Control,
    ]);

    const ids = generateUniqueIds(ParentTypePlus.User, parentType);
    records.push({
      parentType,
      parentId: ids.parentId,
      ownerId: ids.childId,
    });
  }

  return records;
};

const sheet: Sheet<'contributors.csv', CsvType, InsertType> = {
  name: 'contributors.csv',
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
      key: 'ownerId',
      type: 'string',
      foreignKey: ParentTypePlus.User,
    },
  ],
  constraints: [
    {
      type: 'unique',
      fields: ['ownerId', 'parentId'],
    },
  ],
  mapToInsert,
  generateMockData,
};

export default sheet;
