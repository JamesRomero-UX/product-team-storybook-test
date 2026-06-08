import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { IssueUpdateInsertInput } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockDescription, mockTitle } from '../services/mockData';
import {
  CustomAttributeData,
  thirdPartyIdSchema,
} from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

type InsertType = IssueUpdateInsertInput;

const schema = z.object({
  id: thirdPartyIdSchema,
  title: z.string(),
  parentIssueId: thirdPartyIdSchema,
  description: z.string(),
  CustomAttributeData,
});

type CsvType = z.infer<typeof schema>;

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    Id: c.id,
    Title: c.title,
    Description: c.description,
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

export const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.issueUpdatesCount; i++) {
    records.push({
      id: (i + 1).toString(),
      title: mockTitle(),
      parentIssueId: faker.number
        .int({ min: 1, max: generateConfig.issueCount })
        .toString(),
      description: mockDescription(),
    });
  }

  return records;
};

const sheet: Sheet<'issueUpdates.csv', CsvType, InsertType> = {
  name: 'issueUpdates.csv',
  schema,
  objectType: ParentTypeEnum.IssueUpdate,
  customAttributeType: ParentTypeEnum.IssueUpdate,
  fields: [
    {
      key: 'id',
      type: 'string',
      isPrimaryKey: true,
    },
    {
      key: 'parentIssueId',
      type: 'string',
      foreignKey: ParentTypeEnum.Issue,
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
  ],
  mapToInsert,
  generateMockData,
};

export default sheet;
