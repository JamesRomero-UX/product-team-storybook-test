import type { GetOrganizationMemberRoles200ResponseOneOfInner } from 'auth0';

export const auth0CustomerSupportRole = {
  id: 'rol_6Uz5rPURc0l4ihRX',
  name: 'CustomerSupport',
  description: 'Customer Support',
};
export const auth0PublicRole = {
  id: 'rol_npTYrMrZNzRJ4x13',
  name: 'Public',
  description: 'Public Access Forms / Default',
};
export const auth0ReportingAdminRole = {
  id: 'rol_iq0UNbl7YoHmJasj',
  name: 'QuickSight-Admin-Role',
  description: 'Reporting Admin',
};
export const auth0ReadOnlyRole = {
  id: 'rol_PXDRdeouYaxNck5Q',
  name: 'ReadOnly',
  description: 'Full ReadOnly Access',
};
export const auth0RiskManagerRole = {
  id: 'rol_Nm0MYvAH5dpArHrH',
  name: 'RiskManager',
  description: 'Risk Manager / Admin',
};
export const auth0StandardRole = {
  id: 'rol_tyYWnbJZQUu9XOoP',
  name: 'Standard',
  description: 'Permissions granted by being an owner or contributor',
};
export const auth0StandardEnhancedRole = {
  id: 'rol_nLEl5fuOSGNNgXmY',
  name: 'StandardEnhanced',
  description: 'Standard Enhanced',
};
export const auth0InternalAuditRole = {
  id: 'rol_Ow4YwMCrBTTVz0Cs',
  name: 'InternalAudit',
  description: 'Internal Audit',
};
export const auth0TechnicalSupportRole = {
  id: 'rol_E4Vgh1WFCj8sUZcL',
  name: 'TechnicalSupport',
  description: 'Technical Support',
};

export const auth0Roles: GetOrganizationMemberRoles200ResponseOneOfInner[] = [
  auth0CustomerSupportRole,
  auth0PublicRole,
  auth0ReportingAdminRole,
  auth0ReadOnlyRole,
  auth0RiskManagerRole,
  auth0StandardRole,
  auth0StandardEnhancedRole,
  auth0InternalAuditRole,
  auth0TechnicalSupportRole,
];
