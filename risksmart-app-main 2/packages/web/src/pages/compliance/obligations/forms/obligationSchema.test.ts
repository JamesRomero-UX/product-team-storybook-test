import { Obligation_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { SafeParseError } from 'zod';

import type { ObligationFormFieldData } from './obligationSchema';
import { ObligationSchema } from './obligationSchema';

describe('Test Obligations Schema', () => {
  describe('ObligationSchema', () => {
    const validTestData: ObligationFormFieldData = {
      Adherence: 'optional',
      Description: 'some description',
      Title: 'Some Obligation',
      tags: [],
      departments: [],
      Type: Obligation_Type_Enum.Rule,
      ParentId: 'ff33de3f-3f3c-485e-a8d7-af16d1a72e94',
      Owners: [{ value: 'ff33de3f-3f3c-485e-a8d7-af16d1a72e99', type: 'user' }],
      Interpretation: 'some interpretation',
      TagTypeIds: ['blah', 'blah'],
      DepartmentTypeIds: ['blah', 'blah'],
      CustomAttributeData: null,
      Contributors: [],
      ancestorContributors: [],
      schedule: {},
    };

    it('should validate valid data', () => {
      const result = ObligationSchema.safeParse(validTestData);
      expect(result).toStrictEqual({ data: validTestData, success: true });
    });

    it.each([['ParentId']])(
      'should require a valid uuid for %s value',
      (propName) => {
        const testData = {
          ...validTestData,
          [propName]: '123',
        };
        const result = ObligationSchema.safeParse(
          testData
        ) as SafeParseError<ObligationFormFieldData>;
        expect(result.success).toStrictEqual(false);
        expect(result.error).toBeDefined();
      }
    );

    it.each([['Adherence'], ['Description'], ['Title'], ['Owners']])(
      'should validate required string prop %s value',
      (propName) => {
        const testData = {
          ...validTestData,
          [propName]: '',
        };
        const result = ObligationSchema.safeParse(
          testData
        ) as SafeParseError<ObligationFormFieldData>;
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      }
    );

    it.each([
      [Obligation_Type_Enum.Chapter, true],
      [Obligation_Type_Enum.Rule, true],
      [Obligation_Type_Enum.Standard, true],
      [Obligation_Type_Enum.Task, true],
      ['somestring', false],
      ['chapter', true],
      ['task', true],
    ])(
      'should validate type value %s as an enum option',
      (value, successResult) => {
        const testData = {
          ...validTestData,
          Type: value,
        };
        const result = ObligationSchema.safeParse(testData);
        expect(result.success).toBe(successResult);
      }
    );

    it.each([
      ['', true],
      [null, true],
    ])(
      'accepts an empty value for the optional Interpretation prop',
      (value, successResult) => {
        const testData = {
          ...validTestData,
          Interpretation: value,
        };
        const result = ObligationSchema.safeParse(testData);
        expect(result.success).toBe(successResult);
      }
    );

    it.each([
      [Obligation_Type_Enum.Rule],
      [Obligation_Type_Enum.Chapter],
      [Obligation_Type_Enum.Task],
    ])('should check that parentID is set for type %s', (type) => {
      const testData = {
        ...validTestData,
        ParentId: '',
        Type: type,
      };
      const result = ObligationSchema.safeParse(testData);
      expect(result.success).toBe(false);
    });

    it.each([
      [Obligation_Type_Enum.Rule, 'blah'],
      [Obligation_Type_Enum.Chapter, ''],
      [Obligation_Type_Enum.Standard, ''],
      [Obligation_Type_Enum.Task, ''],
    ])(
      'checks that Description is required for only Rule type obligations',
      (type, description) => {
        const testData = {
          ...validTestData,
          Type: type,
          Description: description,
        };
        const result = ObligationSchema.safeParse(testData);
        expect(result.success).toBe(true);
      }
    );
  });
});
