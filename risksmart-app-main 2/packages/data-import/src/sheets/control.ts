import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type {
  ControlInsertInput,
  ControlUpdates,
} from '../../generated/graphql';
import { ControlTypeEnum, ParentTypeEnum } from '../../generated/graphql';
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
  type: z.nativeEnum(ControlTypeEnum).nullable(),
  CustomAttributeData,
});
type CsvType = z.infer<typeof schema>;
type InsertType = ControlInsertInput;
type UpdateType = ControlUpdates;

const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 1; i <= generateConfig.controlCount; i++) {
    records.push({
      description: mockDescription(),
      id: i.toString(),
      title: mockTitle(),
      type: faker.helpers.enumValue(ControlTypeEnum),
    });
  }

  return records;
};
const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    Description: c.description ?? '',
    Id: c.id,
    Meta: null,
    OrgKey: orgKey,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    Title: c.title,
    Type: c.type,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
    CustomAttributeData: c.CustomAttributeData,
  };
};

const mapToUpdate = (c: CsvType, orgKey: string): UpdateType => {
  return {
    where: { Id: { _eq: c.id } },
    _set: {
      Description: c.description,
      Meta: null,
      OrgKey: orgKey,
      CreatedAtTimestamp: undefined,
      ModifiedAtTimestamp: undefined,
      Title: c.title,
      Type: c.type,
      CreatedByUser: 'SYSTEM',
      ModifiedByUser: 'SYSTEM',
      CustomAttributeData: c.CustomAttributeData,
    },
  };
};

const sheet: Sheet<'controls.csv', CsvType, InsertType, UpdateType> = {
  name: 'controls.csv',
  schema,
  objectType: ParentTypeEnum.Control,
  customAttributeType: ParentTypeEnum.Control,
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
      key: 'type',
      fieldConfigFieldId: 'Type',
      type: 'string',
    },
  ],
  generateMockData,
  mapToInsert,
  mapToUpdate,
};

export default sheet;
