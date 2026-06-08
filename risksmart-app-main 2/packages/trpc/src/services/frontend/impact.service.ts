import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getLatestImpactRatingsForRatedImpactsByRatedItemIdQueryConfig } from '@risksmart-app/drizzle/src/queries/impact.query';
import { filter } from '@risksmart-app/permitio/src/permit';

import type { GetLatestImpactRatingsForRatedImpactsByRatedItemIdResponseRow } from '../../types/index';
import { RATING_TYPE_ASSESSMENT } from '../../utils/consts';
import type { ImpactService, ServiceContext } from '../service.types';

export class ImpactServiceImpl implements ImpactService {
  async getLatestImpactRatingsForRatedImpactsByRatedItemId(
    ctx: ServiceContext,
    ratedItemId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const impacts = await db.org((tx) =>
      tx.query.impact.findMany({
        where: {
          ratings: {
            RatedItemId: ratedItemId,
            RatingType: { in: RATING_TYPE_ASSESSMENT },
          },
        },
        ...getLatestImpactRatingsForRatedImpactsByRatedItemIdQueryConfig,
      })
    );

    const filteredImpacts =
      await filter<GetLatestImpactRatingsForRatedImpactsByRatedItemIdResponseRow>(
        impacts,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return filteredImpacts;
  }
}
