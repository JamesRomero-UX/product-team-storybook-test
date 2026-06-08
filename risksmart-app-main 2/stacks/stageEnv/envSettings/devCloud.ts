import { EnvSettings } from '../env';

export const devCloud: EnvSettings = {
  tenantSettings: [{ name: 'MultiTenant', region: 'eu-west-2' }, { name: 'OctoEnergy', region: 'eu-west-2' }],
  subdomain: 'dev-cloud',
  cdkStagePrefix: (stage) => stage,
  logRetention: 'infinite',
};
