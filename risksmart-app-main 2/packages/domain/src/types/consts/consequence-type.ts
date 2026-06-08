export const ConsequenceType = {
  Customer: 'customer',
  Financial: 'financial',
  LegalAndRegulatory: 'legal_and_regulatory',
  Operational: 'operational',
  Reputational: 'reputational',
} as const;

export type ConsequenceType =
  (typeof ConsequenceType)[keyof typeof ConsequenceType];
