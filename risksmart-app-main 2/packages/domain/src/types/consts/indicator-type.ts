export const IndicatorType = {
  Boolean: 'boolean',
  Number: 'number',
  Text: 'text',
} as const;
export type IndicatorType = (typeof IndicatorType)[keyof typeof IndicatorType];
