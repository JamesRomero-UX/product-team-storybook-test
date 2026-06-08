import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { ConsequenceInsertInput } from '../../generated/graphql';
import { CostTypeEnum, ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockDescription, mockTitle } from '../services/mockData';
import {
  CustomAttributeData,
  thirdPartyIdSchema,
} from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

type InsertType = ConsequenceInsertInput;

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    Id: c.id,
    Title: c.title,
    Description: c.description ?? '',
    CostType: c.costType,
    CostValue: c.costValue,
    Criticality: c.criticality,
    ParentIssueId: c.parentIssueId,
    Meta: null,
    OrgKey: orgKey,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
    CustomAttributeData: c.CustomAttributeData,
  };
};

const schema = z.object({
  id: thirdPartyIdSchema,
  title: z.string(),
  description: z.string().nullable(),
  criticality: z.number().int().min(1).max(5).nullable(),
  costType: z.nativeEnum(CostTypeEnum),
  costValue: z.number().min(0),
  parentIssueId: thirdPartyIdSchema,
  CustomAttributeData,
});

type CsvType = z.infer<typeof schema>;

export const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 1; i <= generateConfig.consequencesCount; i++) {
    records.push({
      id: i.toString(),
      costType: faker.helpers.enumValue(CostTypeEnum),
      title: mockTitle(),
      description: mockDescription(),
      criticality: faker.number.int({ min: 1, max: 5 }),
      costValue: faker.number.int({ min: 0, max: 20000 }),
      parentIssueId: faker.number
        .int({ min: 1, max: generateConfig.issueCount })
        .toString(),
    });
  }

  return records;
};

const sheet: Sheet<'consequences.csv', CsvType, InsertType> = {
  name: 'consequences.csv',
  schema,
  objectType: ParentTypeEnum.Consequence,
  customAttributeType: ParentTypeEnum.Consequence,
  fields: [
    {
      key: 'id',
      type: 'string',
      isPrimaryKey: true,
    },
    {
      key: 'title',
      fieldConfigFieldId: 'Title',
      type: 'string',
    },
    {
      key: 'description',
      fieldConfigFieldId: 'Description',
      type: 'string',
    },
    {
      key: 'criticality',
      fieldConfigFieldId: 'Criticality',
      type: 'number',
    },
    {
      key: 'costType',
      fieldConfigFieldId: 'CostType',
      type: 'string',
    },
    {
      key: 'costValue',
      fieldConfigFieldId: 'CostValue',
      type: 'number',
    },
    {
      key: 'parentIssueId',
      type: 'string',
      foreignKey: ParentTypeEnum.Issue,
    },
  ],
  mapToInsert,
  generateMockData,
};

export default sheet;
