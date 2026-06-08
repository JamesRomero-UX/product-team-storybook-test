export const RiskTreatmentType = {
  Terminate: 'terminate',
  Tolerate: 'tolerate',
  Transfer: 'transfer',
  Treat: 'treat',
} as const;
export type RiskTreatmentType =
  (typeof RiskTreatmentType)[keyof typeof RiskTreatmentType];
