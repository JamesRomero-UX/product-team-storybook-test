import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getAggregationSettingsForOrgQueryConfig } from '@risksmart-app/drizzle/src/queries/aggregation.query';
import { bulkCheck } from '@risksmart-app/permitio/src/permit';

import type { AggregationService, ServiceContext } from '../service.types';

export class AggregationServiceImpl implements AggregationService {
  async getAggregationSettingsForOrg(ctx: ServiceContext) {
    const result = await bulkCheck(
      [{ resourceName: 'aggregation_org', action: 'read' }],
      ctx.userId,
      ctx.orgId
    );

    if (!result.some((check) => check.action === 'read')) {
      return [];
    }

    const db = await createDrizzleClient(ctx);
    const data = await db.org((tx) => {
      return tx.query.aggregation_org.findMany({
        ...getAggregationSettingsForOrgQueryConfig,
      });
    });

    return data;
  }
}
