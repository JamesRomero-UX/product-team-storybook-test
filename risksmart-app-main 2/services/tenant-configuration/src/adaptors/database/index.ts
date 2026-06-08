// services/tenant-configuration/src/adaptors/database/index.ts
export type { OrganisationConfig, TenantConfig } from '../../domain/types.js';
export {
  getAllOrganisationsForRegion,
  getAllOrganisationsForTenant,
  getAllTenantConfigs,
  getTenantConfigFromDynamoDB,
  getTenantForOrganisation,
} from './tenant-config.js';
