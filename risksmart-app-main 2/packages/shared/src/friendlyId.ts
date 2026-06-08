import type { ParentType } from '@risksmart-app/domain/src/types/consts';
import { ParentTypes } from '@risksmart-app/domain/src/types/consts';

type PrefixLookup = { [parentType in ParentType]?: string };
const prefixLookup: PrefixLookup = {
  [ParentTypes.Indicator]: 'IN',
  [ParentTypes.Issue]: 'I',
  [ParentTypes.ImpactRating]: 'IR',
  [ParentTypes.Impact]: 'IM',
  [ParentTypes.Action]: 'A',
  [ParentTypes.Risk]: 'R',
  [ParentTypes.Obligation]: 'O',
  [ParentTypes.Control]: 'C',
  [ParentTypes.Assessment]: 'ASMT',
  [ParentTypes.BusinessArea]: 'BA',
  [ParentTypes.InternalAuditEntity]: 'IA',
  [ParentTypes.InternalAuditReport]: 'IAR',
  [ParentTypes.Document]: 'D',
  [ParentTypes.ChangeRequest]: 'CR',
  [ParentTypes.Acceptance]: 'ACC',
  [ParentTypes.Appetite]: 'APT',
  [ParentTypes.ComplianceMonitoringAssessment]: 'CMA',
  [ParentTypes.TestResult]: 'TR',
  [ParentTypes.EnterpriseRisk]: 'ER',
};

export const getFriendlyId = (
  objectType: ParentType,
  sequentialId?: null | number
): string => {
  const prefix = prefixLookup[objectType];
  if (prefix) {
    return `${prefix}-${sequentialId}`;
  }

  return (sequentialId ?? '').toString();
};
