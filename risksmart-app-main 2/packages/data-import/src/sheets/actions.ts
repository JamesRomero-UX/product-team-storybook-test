import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { ActionInsertInput, ActionUpdates } from '../../generated/graphql';
import { ActionStatusEnum, ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockDescription, mockPastDate, mockTitle } from '../services/mockData';
import {
  CustomAttributeData,
  dateTimeString,
  thirdPartyIdSchema,
} from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

const schema = z.object({
  id: thirdPartyIdSchema,
  title: z.string(),
  description: z.string().nullable(),
  priority: z.number().int().min(1).max(3).nullable(),
  status: z.nativeEnum(ActionStatusEnum),
  dateDue: dateTimeString,
  dateRaised: dateTimeString,
  dateClosed: dateTimeString.nullable(),
  CustomAttributeData,
});

type CsvType = z.infer<typeof schema>;
type InsertType = ActionInsertInput;
type UpdateType = ActionUpdates;

const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.actionCount; i++) {
    records.push({
      id: (i + 1).toString(),
      title: mockTitle(),
      description: mockDescription(),
      dateRaised: mockPastDate(),
      dateDue: faker.date.anytime().toISOString(),
      dateClosed: faker.date.anytime().toISOString(),
      priority: faker.number.int({ min: 1, max: 3 }),
      status: faker.helpers.enumValue(ActionStatusEnum),
    });
  }

  return records;
};

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    Id: c.id,
    Title: c.title,
    Description: c.description ?? '-',
    Status: c.status,
    DateDue: c.dateDue,
    DateRaised: c.dateRaised,
    Priority: c.priority,
    Meta: null,
    OrgKey: orgKey,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    ClosedDate: c.dateClosed,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
    CustomAttributeData: c.CustomAttributeData,
  };
};

const mapToUpdate = (c: CsvType, orgKey: string): UpdateType => {
  return {
    where: { Id: { _eq: c.id } },
    _set: {
      Title: c.title,
      Description: c.description ?? '-',
      Status: c.status,
      DateDue: c.dateDue,
      DateRaised: c.dateRaised,
      Priority: c.priority,
      Meta: null,
      OrgKey: orgKey,
      CreatedAtTimestamp: undefined,
      ModifiedAtTimestamp: undefined,
      ClosedDate: null,
      CreatedByUser: 'SYSTEM',
      ModifiedByUser: 'SYSTEM',
      CustomAttributeData: c.CustomAttributeData,
    },
  };
};

const sheet: Sheet<'actions.csv', CsvType, InsertType> = {
  name: 'actions.csv',
  schema,
  objectType: ParentTypeEnum.Action,
  customAttributeType: ParentTypeEnum.Action,
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
      key: 'priority',
      fieldConfigFieldId: 'Priority',
      type: 'number',
    },
    {
      key: 'dateRaised',
      fieldConfigFieldId: 'DateRaised',
      type: 'date',
    },
    {
      key: 'dateDue',
      fieldConfigFieldId: 'DateDue',
      type: 'date',
    },
    {
      key: 'dateClosed',
      fieldConfigFieldId: 'ClosedDate',
      type: 'date',
    },
    {
      key: 'status',
      fieldConfigFieldId: 'Status',
      type: 'string',
    },
  ],
  mapToInsert,
  mapToUpdate,
  generateMockData,
};

export default sheet;
