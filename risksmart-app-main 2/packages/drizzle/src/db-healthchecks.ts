import { getAllTenantConfigs } from '@risksmart-app/tenant-configuration/src/adaptors/database/index';

import { createDrizzleClient } from './db';
import { getEnv } from './utils/environment';
import { logger } from './utils/logger';

export const dbHealthChecks = async () => {
  const region = getEnv('AWS_REGION');
  const tenantConfigs = await getAllTenantConfigs(region);
  const results: Record<string, boolean> = {};

  for (const tenant of tenantConfigs.filter((t) => t.region === region)) {
    try {
      const db = await createDrizzleClient(
        { orgId: 'admin', tenant: tenant.tenant, userId: 'SYSTEM' },
        false
      );
      await db.admin.execute('SELECT current_timestamp;');
      results[tenant.tenant] = true;
    } catch (error) {
      logger.error(
        { error, tenant: tenant.tenant },
        'Database health check failed'
      );
      results[tenant.tenant] = false;
    }
  }

  return results;
};
