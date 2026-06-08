export const WizardStatus = {
  InProgress: 'inProgress',
  Planned: 'planned',
} as const;

export type WizardStatus = (typeof WizardStatus)[keyof typeof WizardStatus];
