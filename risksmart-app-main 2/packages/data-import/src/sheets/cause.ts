import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type {
  CauseInsertInput,
  ControlInsertInput,
} from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockDescription, mockTitle } from '../services/mockData';
import {
  CustomAttributeData,
  thirdPartyIdSchema,
} from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

const schema = z.object({
  id: thirdPartyIdSchema,
  title: z.string(),
  description: z.string().nullable(),
  significance: z.number().int().min(1).max(5).nullish(),
  parentIssueId: thirdPartyIdSchema,
  CustomAttributeData,
});
type CsvType = z.infer<typeof schema>;
type InsertType = CauseInsertInput;

export const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.causesCount; i++) {
    records.push({
      id: (i + 1).toString(),
      title: mockTitle(),
      description: mockDescription(),
      significance: faker.number.int({ min: 1, max: 5 }),
      parentIssueId: faker.number
        .int({ min: 1, max: generateConfig.issueCount })
        .toString(),
    });
  }

  return records;
};

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    Id: c.id,
    Title: c.title,
    Description: c.description ?? '',
    Significance: c.significance,
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

const sheet: Sheet<'causes.csv', CsvType, ControlInsertInput> = {
  name: 'causes.csv',
  schema,
  objectType: ParentTypeEnum.Cause,
  customAttributeType: ParentTypeEnum.Cause,
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
      key: 'significance',
      fieldConfigFieldId: 'Significance',
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
