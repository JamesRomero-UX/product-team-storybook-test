import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { ActionParentInsertInput } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockUniqueCompositeId } from '../services/mockData';
import { thirdPartyIdSchema } from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

const schema = z.object({
  parentId: thirdPartyIdSchema,
  parentType: z.nativeEnum(ParentTypeEnum),
  actionId: thirdPartyIdSchema,
});

type CsvType = z.infer<typeof schema>;
type InsertType = ActionParentInsertInput;

const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  const generateUniqueIds = mockUniqueCompositeId();

  for (let i = 1; i <= generateConfig.controlParentsCount; i++) {
    const parentType: ParentTypeEnum = faker.helpers.arrayElement([
      ParentTypeEnum.Risk,
      ParentTypeEnum.Issue,
      ParentTypeEnum.Obligation,
      ParentTypeEnum.Control,
    ]);
    const ids = generateUniqueIds(ParentTypeEnum.Action, parentType);
    records.push({
      parentType: parentType,
      actionId: ids.childId,
      parentId: ids.parentId,
    });
  }

  return records;
};

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    ParentId: c.parentId,
    ActionId: c.actionId,
    OrgKey: orgKey,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
    ParentType: c.parentType,
  };
};

const sheet: Sheet<'actionParents.csv', CsvType, InsertType> = {
  name: 'actionParents.csv',
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
      key: 'actionId',
      type: 'string',
      foreignKey: ParentTypeEnum.Action,
    },
  ],
  constraints: [
    {
      type: 'unique',
      fields: ['actionId', 'parentId'],
    },
  ],
  mapToInsert,
  generateMockData,
};

export default sheet;
