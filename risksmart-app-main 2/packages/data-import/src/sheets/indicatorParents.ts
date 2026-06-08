import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { IndicatorParentInsertInput } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockUniqueCompositeId } from '../services/mockData';
import { thirdPartyIdSchema } from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

type InsertType = IndicatorParentInsertInput;

const schema = z.object({
  parentId: thirdPartyIdSchema,
  parentType: z.nativeEnum(ParentTypeEnum),
  indicatorId: thirdPartyIdSchema,
});

type CsvType = z.infer<typeof schema>;

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    ParentId: c.parentId,
    IndicatorId: c.indicatorId,
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

  for (let i = 1; i <= generateConfig.indicatorParentsCount; i++) {
    const parentType: ParentTypeEnum = faker.helpers.arrayElement([
      ParentTypeEnum.Risk,
      ParentTypeEnum.Issue,
      ParentTypeEnum.Obligation,
      ParentTypeEnum.Control,
    ]);
    const ids = generateUniqueIds(ParentTypeEnum.Control, parentType);
    records.push({
      parentType: parentType,
      indicatorId: ids.childId,
      parentId: ids.parentId,
    });
  }

  return records;
};

const sheet: Sheet<'indicatorParents.csv', CsvType, InsertType> = {
  name: 'indicatorParents.csv',
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
      key: 'indicatorId',
      type: 'string',
      foreignKey: ParentTypeEnum.Indicator,
    },
  ],
  constraints: [
    {
      type: 'unique',
      fields: ['indicatorId', 'parentId'],
    },
  ],
  mapToInsert,
  generateMockData,
};

export default sheet;
