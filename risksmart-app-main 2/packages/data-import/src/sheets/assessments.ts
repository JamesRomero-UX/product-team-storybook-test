import { z } from 'zod';

import type { AssessmentInsertInput } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import {
  mockDescription,
  mockPastDate,
  mockTitle,
  mockUser,
} from '../services/mockData';
import {
  CustomAttributeData,
  dateTimeString,
  nullableThirdPartyIdSchema,
  thirdPartyIdSchema,
} from '../services/sharedSchemas';
import type { Sheet } from './Sheet';
import { ParentTypePlus } from './types';

type InsertType = AssessmentInsertInput;

const schema = z.object({
  id: thirdPartyIdSchema,
  title: z.string().min(1),
  summary: z.string(),
  actualCompletionDate: dateTimeString.nullable(),
  nextAssessmentDate: dateTimeString.nullable(),
  startDate: dateTimeString.nullable(),
  targetCompletionDate: dateTimeString.nullable(),
  completedByUser: nullableThirdPartyIdSchema,
  CustomAttributeData,
});

type CsvType = z.infer<typeof schema>;

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    Id: c.id,
    Title: c.title,
    Summary: c.summary,
    OrgKey: orgKey,
    CompletedByUser: c.completedByUser,
    StartDate: c.startDate,
    TargetCompletionDate: c.targetCompletionDate,
    ActualCompletionDate: c.actualCompletionDate,
    NextTestDate: c.nextAssessmentDate,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
    CustomAttributeData: c.CustomAttributeData,
  };
};

export const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.assessmentsCount; i++) {
    const id = i + 1;

    records.push({
      id: id.toString(),
      title: mockTitle(),
      summary: mockDescription(),
      completedByUser: mockUser(),
      startDate: mockPastDate(),
      targetCompletionDate: mockPastDate(),
      actualCompletionDate: mockPastDate(),
      nextAssessmentDate: mockPastDate(),
    });
  }

  return records;
};

const sheet: Sheet<'assessments.csv', CsvType, InsertType> = {
  name: 'assessments.csv',
  schema,
  objectType: ParentTypeEnum.Assessment,
  customAttributeType: ParentTypeEnum.Assessment,
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
      key: 'summary',
      fieldConfigFieldId: 'Summary',
      type: 'string',
    },
    {
      key: 'completedByUser',
      fieldConfigFieldId: 'CompletedByUser',
      type: 'string',
      foreignKey: ParentTypePlus.User,
    },
    {
      key: 'startDate',
      fieldConfigFieldId: 'StartDate',
      type: 'date',
    },
    {
      key: 'targetCompletionDate',
      fieldConfigFieldId: 'TargetCompletionDate',
      type: 'date',
    },
    {
      key: 'actualCompletionDate',
      fieldConfigFieldId: 'ActualCompletionDate',
      type: 'date',
    },
    {
      key: 'nextAssessmentDate',
      fieldConfigFieldId: 'NextTestDate',
      type: 'string',
    },
  ],
  mapToInsert,
  generateMockData,
};

export default sheet;
