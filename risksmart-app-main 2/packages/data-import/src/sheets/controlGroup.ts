import { z } from 'zod';

import type { ControlGroupInsertInput } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockDescription, mockTitle, mockUser } from '../services/mockData';
import {
  CustomAttributeData,
  thirdPartyIdSchema,
} from '../services/sharedSchemas';
import type { Sheet } from './Sheet';
import { ParentTypePlus } from './types';

const schema = z.object({
  id: thirdPartyIdSchema,
  title: z.string(),
  owner: thirdPartyIdSchema,
  description: z.string().nullable(),
  CustomAttributeData,
});
type CsvType = z.infer<typeof schema>;
type InsertType = ControlGroupInsertInput;

const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.controlGroupCount; i++) {
    records.push({
      description: mockDescription(),
      id: (i + 1).toString(),
      owner: mockUser(),
      title: mockTitle(),
    });
  }

  return records;
};

const mapToInsert = (c: CsvType, orgKey: string): ControlGroupInsertInput => {
  return {
    Id: c.id,
    Title: c.title,
    Description: c.description || '',
    Owner: c.owner,
    Meta: null,
    OrgKey: orgKey,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
  };
};

export const sheet: Sheet<'controlGroups.csv', CsvType, InsertType> = {
  name: 'controlGroups.csv',
  schema,
  objectType: ParentTypeEnum.ControlGroup,
  customAttributeType: ParentTypeEnum.ControlGroup,
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
      unique: true,
    },
    {
      key: 'description',
      fieldConfigFieldId: 'Description',
      type: 'string',
    },
    {
      key: 'owner',
      type: 'string',
      foreignKey: ParentTypePlus.User,
    },
  ],
  generateMockData,
  mapToInsert,
};
export default sheet;
