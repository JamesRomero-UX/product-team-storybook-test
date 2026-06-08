import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { ScheduleInsertInput } from '../../generated/graphql';
import {
  ParentTypeEnum,
  TestFrequencyEnum,
  UnitOfTimeEnum,
} from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockIdWithParentType } from '../services/mockData';
import { dateTimeString, thirdPartyIdSchema } from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

const schema = z.object({
  id: thirdPartyIdSchema,
  startDate: dateTimeString.nullable(),
  parentType: z.nativeEnum(ParentTypeEnum),
  manualDueDate: dateTimeString.nullable(),
  frequency: z.nativeEnum(TestFrequencyEnum).nullable(),
  timeToCompleteValue: z.number().int().min(1).nullable(),
  timeToCompleteUnit: z.nativeEnum(UnitOfTimeEnum).nullable(),
});
type CsvType = z.infer<typeof schema>;
type InsertType = ScheduleInsertInput;

export const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.tagsCount; i++) {
    const parentType: ParentTypeEnum = faker.helpers.arrayElement([
      ParentTypeEnum.Risk,
      ParentTypeEnum.Indicator,
      ParentTypeEnum.Control,
    ]);
    const id = mockIdWithParentType(parentType);
    records.push({
      parentType,
      id,
      startDate: null,
      manualDueDate: null,
      frequency: null,
      timeToCompleteValue: null,
      timeToCompleteUnit: null,
    });
  }

  return records;
};

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    Id: c.id,
    StartDate: c.startDate,
    ManualDueDate: c.manualDueDate,
    Frequency: c.frequency,
    TimeToCompleteUnit: c.timeToCompleteUnit,
    TimeToCompleteValue: c.timeToCompleteValue,
    OrgKey: orgKey,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
  };
};

export const sheet: Sheet<'schedules.csv', CsvType, InsertType> = {
  name: 'schedules.csv',
  schema,
  fields: [
    {
      key: 'id',
      type: 'string',
      keyDependantForeignKey: 'parentType',
    },
    {
      key: 'parentType',
      fieldConfigFieldId: 'ParentType',
      type: 'string',
    },

    {
      key: 'startDate',
      fieldConfigFieldId: 'StartDate',
      type: 'date',
    },
    {
      key: 'manualDueDate',
      fieldConfigFieldId: 'ManualDueDate',
      type: 'date',
    },
    {
      key: 'frequency',
      fieldConfigFieldId: 'Frequency',
      type: 'string',
    },
    {
      key: 'timeToCompleteValue',
      fieldConfigFieldId: 'TimeToCompleteValue',
      type: 'number',
    },
    {
      key: 'timeToCompleteUnit',
      fieldConfigFieldId: 'TimeToCompleteUnit',
      type: 'string',
    },
  ],
  generateMockData,
  mapToInsert,
};
export default sheet;
