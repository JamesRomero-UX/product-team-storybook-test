import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { OwnerGroupInsertInput } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockUniqueCompositeId } from '../services/mockData';
import { thirdPartyIdSchema } from '../services/sharedSchemas';
import type { Sheet } from './Sheet';
import { ParentTypePlus } from './types';

type InsertType = OwnerGroupInsertInput;

const schema = z.object({
  parentId: thirdPartyIdSchema,
  userGroupId: thirdPartyIdSchema,
  parentType: z.nativeEnum(ParentTypeEnum),
});

type CsvType = z.infer<typeof schema>;

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    ParentId: c.parentId,
    UserGroupId: c.userGroupId,
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

  for (let i = 1; i <= generateConfig.ownersCount; i++) {
    const parentType: ParentTypeEnum = faker.helpers.arrayElement([
      ParentTypeEnum.Risk,
      ParentTypeEnum.Issue,
      ParentTypeEnum.Obligation,
      ParentTypeEnum.Control,
    ]);

    const ids = generateUniqueIds(ParentTypePlus.UserGroup, parentType);
    records.push({
      parentType,
      parentId: ids.parentId,
      userGroupId: ids.childId,
    });
  }

  return records;
};

const sheet: Sheet<'ownerGroups.csv', CsvType, InsertType> = {
  name: 'ownerGroups.csv',
  schema,
  fields: [
    {
      key: 'parentType',
      type: 'string',
    },
    {
      key: 'parentId',
      type: 'string',
      keyDependantForeignKey: 'parentType',
    },

    {
      key: 'userGroupId',
      type: 'string',
      foreignKey: ParentTypePlus.UserGroup,
    },
  ],
  constraints: [
    {
      type: 'unique',
      fields: ['userGroupId', 'parentId'],
    },
  ],
  mapToInsert,
  generateMockData,
};

export default sheet;
