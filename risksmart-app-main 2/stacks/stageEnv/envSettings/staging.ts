import { EnvSettings } from '../env';

export const staging: EnvSettings = {
  tenantSettings: [{ name: 'MultiTenant', region: 'eu-west-2' }, { name: 'OctoEnergy', region: 'eu-west-2' }, { name: 'TestTenantUS', region: 'us-east-1' }],
  subdomain: 'staging',
  cdkStagePrefix: (stage) => stage,
  logRetention: 'infinite',
};
