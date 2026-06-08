/**
 * Auth0 roles. These roles should also exist in Hasura as Inherited Roles at
 * the top of the tree
 */
export type Roles =
  | 'CustomerSupport'
  | 'Public'
  | 'ReadOnly'
  | 'RiskManager'
  | 'Standard'
  | 'StandardEnhanced';
