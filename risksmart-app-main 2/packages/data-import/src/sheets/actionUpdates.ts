import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { ActionUpdateInsertInput } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockDescription, mockTitle } from '../services/mockData';
import {
  CustomAttributeData,
  thirdPartyIdSchema,
} from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

type InsertType = ActionUpdateInsertInput;

const schema = z.object({
  id: thirdPartyIdSchema,
  title: z.string(),
  parentActionId: thirdPartyIdSchema,
  description: z.string(),
  CustomAttributeData,
});

type CsvType = z.infer<typeof schema>;

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    Id: c.id,
    Title: c.title,
    Description: c.description,
    ParentActionId: c.parentActionId,
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
  for (let i = 0; i < generateConfig.actionUpdatesCount; i++) {
    records.push({
      id: (i + 1).toString(),
      title: mockTitle(),
      parentActionId: faker.number
        .int({ min: 1, max: generateConfig.actionCount })
        .toString(),
      description: mockDescription(),
    });
  }

  return records;
};

const sheet: Sheet<'actionUpdates.csv', CsvType, InsertType> = {
  name: 'actionUpdates.csv',
  schema,
  objectType: ParentTypeEnum.ActionUpdate,
  customAttributeType: ParentTypeEnum.ActionUpdate,
  fields: [
    {
      key: 'id',
      type: 'string',
      isPrimaryKey: true,
    },
    {
      key: 'parentActionId',
      type: 'string',
      foreignKey: ParentTypeEnum.Action,
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
