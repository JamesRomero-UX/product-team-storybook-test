export const UnitOfTime = {
  Day: 'day',
  Week: 'week',
} as const;
export type UnitOfTime = (typeof UnitOfTime)[keyof typeof UnitOfTime];
