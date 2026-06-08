export const RiskAssessmentResultControlType = {
  Controlled: 'Controlled',
  Uncontrolled: 'Uncontrolled',
} as const;
export type RiskAssessmentResultControlType =
  (typeof RiskAssessmentResultControlType)[keyof typeof RiskAssessmentResultControlType];
