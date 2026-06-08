export const RiskStatusType = {
  Active: 'active',
  Emerging: 'emerging',
  Monitored: 'monitored',
  Retired: 'retired',
} as const;
export type RiskStatusType =
  (typeof RiskStatusType)[keyof typeof RiskStatusType];
