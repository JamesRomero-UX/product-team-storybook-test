export const TestType = {
  BusinessLine: 'businessLine',
  FirstLine: '1stLine',
  SecondLine: '2ndLine',
  ThirdLine: '3rdLine',
} as const;
export type TestType = (typeof TestType)[keyof typeof TestType];

const testTypeValues: readonly string[] = Object.values(TestType);
export const isTestType = (value: string): value is TestType =>
  testTypeValues.includes(value);
export const toTestType = (
  value: string | null | undefined
): TestType | null | undefined => {
  if (value == null) {
    return value;
  }

  return isTestType(value) ? value : undefined;
};
