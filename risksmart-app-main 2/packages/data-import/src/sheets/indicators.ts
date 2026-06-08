import _ from 'lodash';
import { z } from 'zod';

import type { IndicatorInsertInput } from '../../generated/graphql';
import {
  IndicatorTypeEnum,
  ParentTypeEnum,
  TestFrequencyEnum,
} from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockDescription, mockTitle } from '../services/mockData';
import {
  CustomAttributeData,
  thirdPartyIdSchema,
} from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

type InsertType = IndicatorInsertInput;

const checkForRequiredToleranceRange = (
  value: CsvType,
  ctx: z.RefinementCtx
) => {
  if (value.type === IndicatorTypeEnum.Number) {
    const limits = [
      value.lowerToleranceNum,
      value.lowerAppetiteNum,
      value.upperAppetiteNum,
      value.upperToleranceNum,
    ];
    const limitsWithValue = limits.filter((l) => !_.isNil(l));

    const outOfSequence = (limitsWithValue as number[]).find(
      (l, i) => i !== 0 && l < (limitsWithValue[i - 1] as number)
    );
    if (outOfSequence) {
      ctx.addIssue({
        message: 'Tolerances/appetites are out of sequence',
        code: z.ZodIssueCode.custom,
        path: ['LowerToleranceNum'],
      });
    }
  }
};

const numberFields = z.object({
  type: z.literal(IndicatorTypeEnum.Number),
});

const textFields = z.object({
  type: z.literal(IndicatorTypeEnum.Text),
  targetValueTxt: z.string().min(1),
});

const boolFields = z.object({
  type: z.literal(IndicatorTypeEnum.Boolean),
});

const typeFields = z.discriminatedUnion('type', [
  numberFields,
  textFields,
  boolFields,
]);

const schema = z
  .object({
    id: thirdPartyIdSchema,
    title: z.string().min(1),
    description: z.string().nullish(),
    type: z.nativeEnum(IndicatorTypeEnum),
    unit: z.string().nullish(),
    testFrequency: z.nativeEnum(TestFrequencyEnum),
    upperToleranceNum: z.number().nullish(),
    lowerToleranceNum: z.number().nullish(),
    upperAppetiteNum: z.number().nullish(),
    lowerAppetiteNum: z.number().nullish(),
    targetValueTxt: z.string().nullish(),
    CustomAttributeData,
  })
  .and(typeFields);

type CsvType = z.infer<typeof schema>;

const superRefinement: z.SuperRefinement<CsvType> = (values, ctx) => {
  checkForRequiredToleranceRange(values, ctx);
};

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    Id: c.id,
    Title: c.title,
    Description: c.description,
    OrgKey: orgKey,
    Type: c.type,
    Unit: c.unit,
    UpperAppetiteNum: c.upperAppetiteNum,
    LowerAppetiteNum: c.lowerAppetiteNum,
    LowerToleranceNum: c.lowerToleranceNum,
    UpperToleranceNum: c.upperToleranceNum,
    TargetValueTxt: c.targetValueTxt,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
    CustomAttributeData: c.CustomAttributeData,
  };
};

const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.indicatorCount; i++) {
    records.push({
      id: (i + 1).toString(),
      title: mockTitle(),
      description: mockDescription(),
      type: IndicatorTypeEnum.Number,
      unit: null,
      upperToleranceNum: 2,
      lowerToleranceNum: 1,
      lowerAppetiteNum: null,
      upperAppetiteNum: null,
      targetValueTxt: null,
      testFrequency: TestFrequencyEnum.Adhoc,
    });
  }

  return records;
};

const sheet: Sheet<'indicators.csv', CsvType, InsertType> = {
  name: 'indicators.csv',
  schema,
  superRefinement,
  objectType: ParentTypeEnum.Indicator,
  customAttributeType: ParentTypeEnum.Indicator,
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
    {
      key: 'unit',
      type: 'string',
    },
    {
      key: 'upperToleranceNum',
      fieldConfigFieldId: 'UpperToleranceNum',
      type: 'number',
    },
    {
      key: 'lowerToleranceNum',
      fieldConfigFieldId: 'LowerToleranceNum',
      type: 'number',
    },
    {
      key: 'lowerAppetiteNum',
      fieldConfigFieldId: 'LowerAppetiteNum',
      type: 'number',
    },
    {
      key: 'upperAppetiteNum',
      fieldConfigFieldId: 'UpperAppetiteNum',
      type: 'number',
    },
    {
      key: 'targetValueTxt',
      fieldConfigFieldId: 'TargetValueTxt',
      type: 'string',
    },
    {
      key: 'testFrequency',
      fieldConfigFieldId: 'TestFrequency',
      type: 'string',
    },
  ],
  mapToInsert,
  generateMockData,
};

export default sheet;
