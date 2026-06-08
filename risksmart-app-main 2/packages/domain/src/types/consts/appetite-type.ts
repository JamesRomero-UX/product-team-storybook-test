export const AppetiteType = {
  Impact: 'impact',
  Likelihood: 'likelihood',
  Risk: 'risk',
} as const;
export type AppetiteType = (typeof AppetiteType)[keyof typeof AppetiteType];
