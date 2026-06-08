import { IndicatorTypeEnum } from 'generated/graphql';

import type { IndicatorFormDataFields } from './schema';
import { PostSchema } from './schema';

describe('indicatorSchema', () => {
  const validIndicator: IndicatorFormDataFields = {
    object: {
      Title: 'Indicator',
      Description: '',
      Type: IndicatorTypeEnum.Number,
      Unit: '',
      UpperToleranceNum: 10,
      LowerToleranceNum: 0,
      UpperAppetiteNum: 4,
      LowerAppetiteNum: 2,
      TagTypeIds: [],
      DepartmentTypeIds: [],
      CustomAttributeData: null,
      OwnerUserIds: ['123'],
      ContributorUserIds: [],
      ParentId: '256be67a-a53b-4070-a0d2-0a17c34de332',
      ContributorGroupIds: [],
      OwnerGroupIds: [],
      schedule: {
        StartDate: null,
        TimeToCompleteUnit: null,
        TimeToCompleteValue: null,
        Frequency: null,
        ManualDueDate: null,
      },
    },
  };

  it('should required TargetValueTxt when Type is text', () => {
    const result = PostSchema.safeParse({
      ...validIndicator,

      object: { ...validIndicator.object, Type: 'text' },
    });
    expect(result.success).toEqual(false);
    expect(!result.success && result.error.errors).toEqual([
      {
        code: 'invalid_type',
        expected: 'string',
        message: 'Required',
        path: ['object', 'TargetValueTxt'],
        received: 'undefined',
      },
    ]);
  });

  it('should validate with a valid indicator', () => {
    expect(PostSchema.safeParse(validIndicator).success).toEqual(true);
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
      const result = PostSchema.safeParse({
        ...validIndicator,
        object: {
          ...validIndicator.object,
          LowerToleranceNum,
          LowerAppetiteNum,
          UpperAppetiteNum,
          UpperToleranceNum,
        },
      });
      expect(result.success).toEqual(false);
    }
  );
});
