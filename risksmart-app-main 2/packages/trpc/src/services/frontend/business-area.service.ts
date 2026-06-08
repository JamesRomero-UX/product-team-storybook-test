import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getBusinessAreasQueryConfig } from '@risksmart-app/drizzle/src/queries/business-area.query';
import { bulkCheck } from '@risksmart-app/permitio/src/permit';

import type { BusinessAreaService, ServiceContext } from '../service.types';

export class BusinessAreaServiceImpl implements BusinessAreaService {
  async getBusinessAreas(ctx: ServiceContext) {
    const result = await bulkCheck(
      [{ resourceName: 'business_area', action: 'read' }],
      ctx.userId,
      ctx.orgId
    );

    if (!result.some((check) => check.action === 'read')) {
      return [];
    }

    const drizzle = await createDrizzleClient(ctx);

    const businessAreas = await drizzle.org((tx) => {
      return tx.query.business_area.findMany({
        orderBy: (business_area, { asc }) => [asc(business_area.Title)],
        ...getBusinessAreasQueryConfig,
      });
    });

    return businessAreas;
  }
}
