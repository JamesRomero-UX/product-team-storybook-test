import { faker } from '@faker-js/faker';
import _, { isNil } from 'lodash';
import { z } from 'zod';

import type { IndicatorResultInsertInput } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockDescription, mockPastDate } from '../services/mockData';
import {
  CustomAttributeData,
  dateTimeString,
  thirdPartyIdSchema,
} from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

type InsertType = IndicatorResultInsertInput;

const checkForRequiredResult = (
  {
    targetValueNum,
    targetValueTxt,
  }: { targetValueTxt?: string | null; targetValueNum?: number | null },
  ctx: z.RefinementCtx
) => {
  const hasNum = !isNil(targetValueNum);
  const hasTxt = !isNil(targetValueTxt);

  if (!hasNum && !hasTxt) {
    ctx.addIssue({
      message: 'Either TargetValueNum or TargetValueTxt is required',
      code: z.ZodIssueCode.custom,
      path: ['TargetValueNum'],
    });
  } else if (hasNum && hasTxt) {
    ctx.addIssue({
      message: 'Cannot specify both TargetValueNum and TargetValueTxt',
      code: z.ZodIssueCode.custom,
      path: ['TargetValueNum'],
    });
  }
};

export const schema = z.object({
  id: thirdPartyIdSchema,
  description: z.string().nullish(),
  resultDate: dateTimeString,
  targetValueNum: z.number().nullish(),
  targetValueTxt: z.string().nullish(),
  indicatorId: thirdPartyIdSchema,
  CustomAttributeData,
});

type CsvType = z.infer<typeof schema>;

const superRefinement: z.SuperRefinement<CsvType> = (values, ctx) => {
  checkForRequiredResult(
    {
      targetValueNum: values.targetValueNum,
      targetValueTxt: values.targetValueTxt,
    },
    ctx
  );
};

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    Id: c.id,
    Description: c.description,
    OrgKey: orgKey,
    TargetValueTxt: c.targetValueTxt,
    TargetValueNum: c.targetValueNum,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    ResultDate: c.resultDate,
    IndicatorId: c.indicatorId,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
    CustomAttributeData: c.CustomAttributeData,
  };
};

export const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.indicatorResultCount; i++) {
    records.push({
      id: (i + 1).toString(),
      description: mockDescription(),
      targetValueNum: 2,
      targetValueTxt: null,
      indicatorId: faker.number
        .int({ min: 1, max: generateConfig.indicatorCount })
        .toString(),
      resultDate: mockPastDate(),
    });
  }

  return records;
};

const sheet: Sheet<'indicatorResults.csv', CsvType, InsertType> = {
  name: 'indicatorResults.csv',
  schema,
  superRefinement,
  objectType: ParentTypeEnum.IndicatorResult,
  customAttributeType: ParentTypeEnum.IndicatorResult,
  fields: [
    {
      key: 'id',
      type: 'string',
      isPrimaryKey: true,
    },
    {
      key: 'description',
      fieldConfigFieldId: 'Description',
      type: 'string',
    },
    {
      key: 'targetValueNum',
      fieldConfigFieldId: 'TargetValueNum',
      type: 'number',
    },
    {
      key: 'targetValueTxt',
      fieldConfigFieldId: 'TargetValueTxt',
      type: 'string',
    },
    {
      key: 'indicatorId',
      type: 'string',
      foreignKey: ParentTypeEnum.Indicator,
    },

    {
      key: 'resultDate',
      fieldConfigFieldId: 'ResultDate',
      type: 'date',
    },
  ],
  mapToInsert,
  generateMockData,
};

export default sheet;
