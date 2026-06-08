import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { TagInsertInput } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockUniqueCompositeId } from '../services/mockData';
import { thirdPartyIdSchema } from '../services/sharedSchemas';
import type { Sheet } from './Sheet';
import { ParentTypePlus } from './types';

type InsertType = TagInsertInput;

const schema = z.object({
  parentId: thirdPartyIdSchema,
  parentType: z.nativeEnum(ParentTypeEnum),
  tagTypeId: thirdPartyIdSchema,
});

type CsvType = z.infer<typeof schema>;

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    ParentId: c.parentId,
    TagTypeId: c.tagTypeId,
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
  for (let i = 0; i < generateConfig.tagsCount; i++) {
    const parentType: ParentTypeEnum = faker.helpers.arrayElement([
      ParentTypeEnum.Risk,
      ParentTypeEnum.Issue,
      ParentTypeEnum.Action,
      ParentTypeEnum.Control,
    ]);
    const ids = generateUniqueIds(ParentTypePlus.TagType, parentType);
    records.push({
      parentType,
      parentId: ids.parentId,
      tagTypeId: ids.childId,
    });
  }

  return records;
};
const sheet: Sheet<'tags.csv', CsvType, InsertType> = {
  name: 'tags.csv',
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
      key: 'tagTypeId',
      type: 'string',
      foreignKey: ParentTypePlus.TagType,
    },
  ],
  constraints: [
    {
      type: 'unique',
      fields: ['tagTypeId', 'parentId'],
    },
  ],
  mapToInsert,
  generateMockData,
};

export default sheet;
