import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type {
  AssessmentResultParentInsertInput,
  ObligationAssessmentResultInsertInput,
} from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockDescription, mockId, mockPastDate } from '../services/mockData';
import {
  CustomAttributeData,
  dateTimeString,
  nullableThirdPartyIdSchema,
  thirdPartyIdSchema,
} from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

export const schema = z.object({
  id: thirdPartyIdSchema,
  obligationId: thirdPartyIdSchema,
  rating: z.number().int().nullable(),
  assessmentId: nullableThirdPartyIdSchema,
  rationale: z.string().nullable(),
  testDate: dateTimeString.nullable(),
  CustomAttributeData,
});
type CsvType = z.infer<typeof schema>;
type InsertType = ObligationAssessmentResultInsertInput;

export const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.obligationAssessmentResultsCount; i++) {
    const id = i + 1;

    records.push({
      id: id.toString(),
      obligationId: mockId('obligationsCount'),
      rationale: mockDescription(),
      testDate: mockPastDate(),
      rating: faker.number.int({ min: 1, max: 5 }),
      assessmentId: mockId('assessmentsCount'),
    });
  }

  return records;
};

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  const parents: AssessmentResultParentInsertInput[] = [
    {
      ParentId: c.obligationId,
      ParentType: ParentTypeEnum.Obligation,
      ResultType: ParentTypeEnum.ObligationAssessmentResult,
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
      ResultType: ParentTypeEnum.ObligationAssessmentResult,
      OrgKey: orgKey,
      CreatedAtTimestamp: undefined,
      CreatedByUser: 'SYSTEM',
      ModifiedAtTimestamp: undefined,
      ModifiedByUser: 'SYSTEM',
    });
  }

  return {
    Id: c.id,
    parents: {
      data: parents,
    },
    Rationale: c.rationale,
    OrgKey: orgKey,
    TestDate: c.testDate,
    CreatedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    Rating: c.rating,
    CustomAttributeData: c.CustomAttributeData,
    ModifiedByUser: 'SYSTEM',
  };
};

const sheet: Sheet<'obligationAssessmentResults.csv', CsvType, InsertType> = {
  name: 'obligationAssessmentResults.csv',
  schema,
  objectType: ParentTypeEnum.ObligationAssessmentResult,
  customAttributeType: ParentTypeEnum.ObligationAssessmentResult,
  fields: [
    {
      key: 'id',
      type: 'string',
      isPrimaryKey: true,
    },
    {
      key: 'obligationId',
      type: 'string',
      foreignKey: ParentTypeEnum.Obligation,
    },
    {
      key: 'rating',
      fieldConfigFieldId: 'Rating',
      type: 'number',
    },
    {
      key: 'assessmentId',
      type: 'string',
      foreignKey: ParentTypeEnum.Assessment,
    },
    {
      key: 'rationale',
      fieldConfigFieldId: 'Rationale',
      type: 'string',
    },
    {
      key: 'testDate',
      fieldConfigFieldId: 'TestDate',
      type: 'date',
    },
  ],
  mapToInsert,
  generateMockData,
};

export default sheet;
