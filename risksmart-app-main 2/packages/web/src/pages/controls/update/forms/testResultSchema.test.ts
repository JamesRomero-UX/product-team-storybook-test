import type { TestResultFormFieldsData } from './testResultSchema';
import { TestResultFormSchema } from './testResultSchema';

describe('Test Result Schema', () => {
  const validTestResult: TestResultFormFieldsData = {
    Title: 'TODO: remove', // TODO: remove from database and here
    Description: 'Description',
    DesignEffectiveness: 1,
    OverallEffectiveness: 1,
    ParentControlIds: [{ value: 'ff33de3f-3f3c-485e-a8d7-af16d1a72e94' }],
    PerformanceEffectiveness: 1,
    Submitter: { value: 'test-user', type: 'user' },
    TestDate: '2023-05-12',
    TestType: '1stLine',
    files: [],
    CustomAttributeData: null,
  };

  it('should validate a valid object', () => {
    const data = validTestResult;
    const result = TestResultFormSchema.safeParse(data, {});
    expect(result).toEqual({ data, success: true });
  });

  it('should give a friendly error when TestDate unset', () => {
    const data: TestResultFormFieldsData = {
      ...validTestResult,
      TestDate: '',
    };
    const result = TestResultFormSchema.safeParse(data, {});
    expect(result.success).toEqual(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toEqual('Required');
    }
  });

  it('should give a friendly error when TestDate is out of range', () => {
    const data: TestResultFormFieldsData = {
      ...validTestResult,
      TestDate: '0000-00-00',
    };
    const result = TestResultFormSchema.safeParse(data, {});
    expect(result.success).toEqual(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toEqual('Invalid date');
    }
  });

  it('should allow undefined DesignEffectiveness', () => {
    const data: TestResultFormFieldsData = {
      ...validTestResult,
      DesignEffectiveness: null,
    };
    const result = TestResultFormSchema.safeParse(data, {});
    expect(result).toEqual({
      data,
      success: true,
    });
  });

  it('should allow undefined PerformanceEffectiveness', () => {
    const data: TestResultFormFieldsData = {
      ...validTestResult,
      PerformanceEffectiveness: null,
    };
    const result = TestResultFormSchema.safeParse(data, {});
    expect(result).toEqual({
      data,
      success: true,
    });
  });
});
