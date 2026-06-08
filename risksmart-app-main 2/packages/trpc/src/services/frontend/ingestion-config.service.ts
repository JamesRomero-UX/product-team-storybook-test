import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getIngestionConfigsQueryConfig } from '@risksmart-app/drizzle/src/queries/ingestion-config.query';
import { bulkCheck } from '@risksmart-app/permitio/src/permit';

import type { IngestionConfigService, ServiceContext } from '../service.types';

export class IngestionConfigServiceImpl implements IngestionConfigService {
  async getAll(ctx: ServiceContext) {
    const result = await bulkCheck(
      [{ resourceName: 'ingestion_config', action: 'read' }],
      ctx.userId,
      ctx.orgId
    );

    if (!result || result.length === 0) {
      return [];
    }

    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      return tx.query.ingestion_config.findMany({
        ...getIngestionConfigsQueryConfig,
      });
    });
  }
}
