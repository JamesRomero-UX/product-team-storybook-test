import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getObligationChangeRegisterQueryConfig } from '@risksmart-app/drizzle/src/queries/obligation-change.query';
import { filter } from '@risksmart-app/permitio/src/permit';

import type { ObligationChangeService, ServiceContext } from '../service.types';

export class ObligationChangeServiceImpl implements ObligationChangeService {
  async getObligationChangesRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.obligation_change.findMany({
        ...getObligationChangeRegisterQueryConfig,
      });
    });

    return filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity: (typeof data)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );
  }

  async getObligationChangeById(ctx: ServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.obligation_change.findMany({
        where: {
          Id: id,
        },
        ...getObligationChangeRegisterQueryConfig,
      });
    });

    return filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity: (typeof data)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );
  }
}
