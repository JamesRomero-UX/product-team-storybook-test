export const CostType = {
  CustomersImpacted: 'customers_impacted',
  Financial: 'financial',
  Hours: 'hours',
  Number: 'number',
} as const;

export type CostType = (typeof CostType)[keyof typeof CostType];
