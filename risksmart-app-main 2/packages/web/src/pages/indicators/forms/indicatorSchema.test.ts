import {
  Indicator_Type_Enum,
  Test_Frequency_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { IndicatorFormDataFields } from './indicatorSchema';
import { indicatorSchema } from './indicatorSchema';

describe('indicatorSchema', () => {
  const validIndicator: IndicatorFormDataFields = {
    Title: 'Indicator',
    Description: '',
    Type: Indicator_Type_Enum.Number,
    Unit: '',
    UpperToleranceNum: 10,
    LowerToleranceNum: 0,
    UpperAppetiteNum: 4,
    LowerAppetiteNum: 2,
    schedule: { Frequency: Test_Frequency_Enum.Daily },
    tags: [],
    departments: [],
    CustomAttributeData: null,
    Owners: [
      {
        type: 'user',
        value: '123',
      },
    ],
    Contributors: [],
    ancestorContributors: [],
    files: [],
  };

  it('should required TargetValueTxt when Type is text', () => {
    const result = indicatorSchema.safeParse({
      ...validIndicator,
      Type: 'text',
    });
    expect(result.success).toEqual(false);
    expect(!result.success && result.error.errors).toEqual([
      {
        code: 'invalid_type',
        expected: 'string',
        message: 'Required',
        path: ['TargetValueTxt'],
        received: 'undefined',
      },
    ]);
  });

  it('should validate with a valid indicator', () => {
    expect(indicatorSchema.safeParse(validIndicator).success).toEqual(true);
  });

  it.each([
    {
      LowerToleranceNum: 2,
      LowerAppetiteNum: 1,
      UpperAppetiteNum: 2,
      UpperToleranceNum: 3,
    },
    {
      LowerToleranceNum: 1,
      LowerAppetiteNum: 2,
      UpperAppetiteNum: 4,
      UpperToleranceNum: 1,
    },
  ])(
    'limits must increase in size',
    ({
      LowerToleranceNum,
      LowerAppetiteNum,
      UpperAppetiteNum,
      UpperToleranceNum,
    }) => {
      const result = indicatorSchema.safeParse({
        ...validIndicator,
        LowerToleranceNum,
        LowerAppetiteNum,
        UpperAppetiteNum,
        UpperToleranceNum,
      });
      expect(result.success).toEqual(false);
    }
  );
});
