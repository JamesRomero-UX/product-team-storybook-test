import { EnvSettings } from '../env';

export const local: EnvSettings = {
  tenantSettings: [{ name: 'MultiTenant', region: 'eu-west-2' }],
  addTestingEventBridgeRules: true,
  cdkStagePrefix: (stage) => stage,
  logRetention: 'one_day',
};
