export const TestFrequency = {
  Adhoc: 'adhoc',
  Annually: 'annually',
  Biannually: 'biannually',
  Daily: 'daily',
  Fortnightly: 'fortnightly',
  FourWeekly: 'fourweekly',
  Monthly: 'monthly',
  Quarterly: 'quarterly',
  Weekly: 'weekly',
} as const;
export type TestFrequency = (typeof TestFrequency)[keyof typeof TestFrequency];
