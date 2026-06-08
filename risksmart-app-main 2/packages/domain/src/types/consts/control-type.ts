export const ControlType = {
  Corrective: 'Corrective',
  Detective: 'Detective',
  Directive: 'Directive',
  Preventive: 'Preventive',
} as const;
export type ControlType = (typeof ControlType)[keyof typeof ControlType];
