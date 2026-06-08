import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type {
  AssessmentResultParentInsertInput,
  TestResultInsertInput,
} from '../../generated/graphql';
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

const schema = z.object({
  id: thirdPartyIdSchema,
  title: z.string(),
  submitter: thirdPartyIdSchema,
  parentControlId: thirdPartyIdSchema,
  assessmentId: nullableThirdPartyIdSchema,
  testType: z
    .enum(['businessLine', '1stLine', '2ndLine', '3rdLine'])
    .nullable(),
  description: z.string().nullable(),
  designEffectiveness: z.number().int().min(0).max(4).nullable(),
  performanceEffectiveness: z.number().int().min(0).max(4).nullable(),
  overallEffectiveness: z.number().int().min(0).max(4).nullable(),
  testDate: dateTimeString,
  nextTestDate: dateTimeString.nullable(),
  CustomAttributeData,
});
type CsvType = z.infer<typeof schema>;
type InsertType = TestResultInsertInput;

const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.testResultCount; i++) {
    records.push({
      description: mockDescription(),
      id: (i + 1).toString(),
      title: mockTitle(),
      submitter: mockUser(),
      parentControlId: faker.number
        .int({ min: 1, max: generateConfig.controlCount })
        .toString(),
      testType: faker.helpers.arrayElement([
        'businessLine',
        '1stLine',
        '2ndLine',
        '3rdLine',
        null,
      ]),
      designEffectiveness: faker.helpers.arrayElement([0, 1, 2, 3, 4, null]),
      performanceEffectiveness: faker.helpers.arrayElement([
        0,
        1,
        2,
        3,
        4,
        null,
      ]),
      overallEffectiveness: faker.helpers.arrayElement([0, 1, 2, 3, 4, null]),
      testDate: mockPastDate(),
      nextTestDate: mockPastDate(),
      assessmentId: null,
    });
  }

  return records;
};

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  const parents: AssessmentResultParentInsertInput[] = [
    {
      ParentId: c.parentControlId,
      ParentType: ParentTypeEnum.Control,
      ResultType: ParentTypeEnum.TestResult,
      OrgKey: orgKey,
      CreatedAtTimestamp: undefined,
      CreatedByUser: 'SYSTEM',
      ModifiedAtTimestamp: undefined,
      ModifiedByUser: 'SYSTEM',
    },
  ];

  if (c.assessmentId) {
    parents.push({
      ParentId: c.assessmentId,
      ParentType: ParentTypeEnum.Assessment,
      ResultType: ParentTypeEnum.TestResult,
      OrgKey: orgKey,
      CreatedAtTimestamp: undefined,
      CreatedByUser: 'SYSTEM',
      ModifiedAtTimestamp: undefined,
      ModifiedByUser: 'SYSTEM',
    });
  }

  return {
    Id: c.id,
    assessmentParents: {
      data: parents,
    },
    Title: c.title,
    Description: c.description || '',
    Submitter: c.submitter,
    TestType: c.testType,
    DesignEffectiveness: c.designEffectiveness,
    PerformanceEffectiveness: c.performanceEffectiveness,
    OverallEffectiveness: c.overallEffectiveness,
    NextTestDate: c.nextTestDate,
    TestDate: c.testDate,
    ParentControlId: c.parentControlId,
    Meta: null,
    OrgKey: orgKey,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
    CustomAttributeData: c.CustomAttributeData,
  };
};

const sheet: Sheet<'testResults.csv', CsvType, InsertType> = {
  name: 'testResults.csv',
  schema,
  objectType: ParentTypeEnum.TestResult,
  customAttributeType: ParentTypeEnum.TestResult,

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
      key: 'submitter',
      fieldConfigFieldId: 'Submitter',
      type: 'string',
      foreignKey: ParentTypePlus.User,
    },
    {
      key: 'parentControlId',
      type: 'string',
      foreignKey: ParentTypeEnum.Control,
    },
    {
      key: 'description',
      fieldConfigFieldId: 'Description',
      type: 'string',
    },
    {
      key: 'testType',
      fieldConfigFieldId: 'TestType',
      type: 'string',
    },
    {
      key: 'designEffectiveness',
      fieldConfigFieldId: 'DesignEffectiveness',
      type: 'number',
    },
    {
      key: 'performanceEffectiveness',
      fieldConfigFieldId: 'PerformanceEffectiveness',
      type: 'number',
    },
    {
      key: 'overallEffectiveness',
      fieldConfigFieldId: 'OverallEffectiveness',
      type: 'number',
    },
    {
      key: 'testDate',
      fieldConfigFieldId: 'TestDate',
      type: 'date',
    },
    {
      key: 'nextTestDate',
      fieldConfigFieldId: 'NextTestDate',
      type: 'date',
    },
    {
      key: 'assessmentId',
      type: 'string',
      foreignKey: ParentTypeEnum.Assessment,
    },
  ],
  generateMockData,
  mapToInsert,
};

export default sheet;
