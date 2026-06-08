import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

type PrefixLookup = { [parentType in Parent_Type_Enum]?: string };
const prefixLookup: PrefixLookup = {
  [Parent_Type_Enum.Indicator]: 'IN',
  [Parent_Type_Enum.Issue]: 'I',
  [Parent_Type_Enum.IssueBreachLog]: 'BL',
  [Parent_Type_Enum.IssueConsumerDuty]: 'CD',
  [Parent_Type_Enum.IssueCustomerTrust]: 'CT',
  [Parent_Type_Enum.IssueGdprBreachLog]: 'GDPR',
  [Parent_Type_Enum.IssuePciBreachLog]: 'PCI',
  [Parent_Type_Enum.IssueRiskEvent]: 'RE',
  [Parent_Type_Enum.IssueSarLog]: 'SAR',
  [Parent_Type_Enum.ImpactRating]: 'IR',
  [Parent_Type_Enum.Impact]: 'IM',
  [Parent_Type_Enum.Action]: 'A',
  [Parent_Type_Enum.Risk]: 'R',
  [Parent_Type_Enum.Obligation]: 'O',
  [Parent_Type_Enum.Control]: 'C',
  [Parent_Type_Enum.Assessment]: 'ASMT',
  [Parent_Type_Enum.BusinessArea]: 'BA',
  [Parent_Type_Enum.InternalAuditEntity]: 'IA',
  [Parent_Type_Enum.InternalAuditReport]: 'IAR',
  [Parent_Type_Enum.Document]: 'D',
  [Parent_Type_Enum.ChangeRequest]: 'CR',
  [Parent_Type_Enum.Acceptance]: 'ACC',
  [Parent_Type_Enum.Appetite]: 'APT',
  [Parent_Type_Enum.ComplianceMonitoringAssessment]: 'CMA',
  [Parent_Type_Enum.TestResult]: 'TR',
  [Parent_Type_Enum.ThirdParty]: 'TP',
  [Parent_Type_Enum.EnterpriseRisk]: 'ER',
  [Parent_Type_Enum.ObligationChange]: 'RCF',
};

// check none of the friendly IDs are the same for different objects
const values = Object.values(prefixLookup);
const uniqueValues = new Set(values);
if (values.length !== uniqueValues.size) {
  throw new Error('Duplicate prefix values found');
}

export const getFriendlyId = (
  objectType: Parent_Type_Enum,
  sequentialId?: null | number
): string => {
  const prefix = prefixLookup[objectType];

  if (prefix) {
    return `${prefix}-${sequentialId}`;
  }

  return (sequentialId ?? '').toString();
};
