import { hasLengthAtLeast } from '@risksmart-app/shared/typeGuards';

export const getDefaultRole = (userRoles: string[]) => {
  if (!hasLengthAtLeast(userRoles, 1)) {
    return 'Public';
  }
  if (userRoles.includes('RiskManager')) {
    return 'RiskManager';
  }
  if (userRoles.includes('Standard')) {
    return 'Standard';
  }
  if (userRoles.includes('CustomerSupport')) {
    return 'CustomerSupport';
  }
  if (userRoles.includes('StandardEnhanced')) {
    return 'StandardEnhanced';
  }

  // If no role matches, return the top one
  return userRoles[0];
};
