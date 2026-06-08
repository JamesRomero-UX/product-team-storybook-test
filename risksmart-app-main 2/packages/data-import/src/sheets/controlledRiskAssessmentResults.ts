import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type {
  AssessmentResultParentInsertInput,
  RiskAssessmentResultInsertInput,
  RiskAssessmentResultUpdates,
} from '../../generated/graphql';
import {
  ParentTypeEnum,
  RiskAssessmentResultControlTypeEnum,
} from '../../generated/graphql';
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
  riskId: thirdPartyIdSchema,
  likelihood: z.number().int().nullable(),
  impact: z.number().int().nullable(),
  rating: z.number().int().nullable(),
  assessmentId: nullableThirdPartyIdSchema,
  rationale: z.string().nullable(),
  resultDate: dateTimeString.nullable(),
  CustomAttributeData,
});
type CsvType = z.infer<typeof schema>;
type InsertType = RiskAssessmentResultInsertInput;
type UpdateType = RiskAssessmentResultUpdates;

export const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.assessmentsCount; i++) {
    const id = i + 1;

    records.push({
      id: id.toString(),
      riskId: mockId('riskCount'),
      rationale: mockDescription(),
      resultDate: mockPastDate(),
      likelihood: faker.number.int({ min: 1, max: 5 }),
      impact: faker.number.int({ min: 1, max: 5 }),
      rating: faker.number.int({ min: 1, max: 5 }),
      assessmentId: mockId('assessmentsCount'),
    });
  }

  return records;
};

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  const parents: AssessmentResultParentInsertInput[] = [
    {
      ParentId: c.riskId,
      ParentType: ParentTypeEnum.Risk,
      ResultType: ParentTypeEnum.RiskAssessmentResult,
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
      ResultType: ParentTypeEnum.RiskAssessmentResult,
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
    ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
    Rationale: c.rationale,
    OrgKey: orgKey,
    TestDate: c.resultDate,
    CreatedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    Likelihood: c.likelihood,
    Impact: c.impact,
    Rating: c.rating,
    CustomAttributeData: c.CustomAttributeData,
    ModifiedByUser: 'SYSTEM',
  };
};

const mapToUpdate = (c: CsvType, orgKey: string): UpdateType => {
  return {
    where: { Id: { _eq: c.id } },
    _set: {
      ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
      Rationale: c.rationale,
      OrgKey: orgKey,
      TestDate: c.resultDate,
      CreatedAtTimestamp: undefined,
      CreatedByUser: 'SYSTEM',
      Likelihood: c.likelihood,
      Impact: c.impact,
      Rating: c.rating,
      CustomAttributeData: c.CustomAttributeData,
    },
  };
};

const sheet: Sheet<'controlledRiskAssessmentResults.csv', CsvType, InsertType> =
  {
    name: 'controlledRiskAssessmentResults.csv',
    schema,
    objectType: ParentTypeEnum.RiskAssessmentResult,
    customAttributeType: ParentTypeEnum.ControlledRiskAssessmentResult,
    fields: [
      {
        key: 'id',
        type: 'string',
        isPrimaryKey: true,
      },
      {
        key: 'riskId',
        type: 'string',
        foreignKey: ParentTypeEnum.Risk,
      },
      {
        key: 'likelihood',
        fieldConfigFieldId: 'Likelihood',
        type: 'number',
      },
      {
        key: 'impact',
        fieldConfigFieldId: 'Impact',
        type: 'number',
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
        key: 'resultDate',
        fieldConfigFieldId: 'ResultDate',
        type: 'date',
      },
    ],
    mapToInsert,
    mapToUpdate,
    generateMockData,
  };

export default sheet;
