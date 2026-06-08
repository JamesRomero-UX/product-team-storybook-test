import { tenantPools } from '@risksmart-app/drizzle/src/db-utils';
import dotenv from 'dotenv';
import path from 'path';
import { afterAll } from 'vitest';

dotenv.config({
  path: path.resolve(process.cwd(), '.env.test'),
});

afterAll(async () => {
  for (const [tenant, pool] of tenantPools) {
    await pool.writer.end();
    await Promise.all(pool.readers.map((r) => r.end()));
    tenantPools.delete(tenant);
  }
});
