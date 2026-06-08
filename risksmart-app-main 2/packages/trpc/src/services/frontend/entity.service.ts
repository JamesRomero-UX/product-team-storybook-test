import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getEntityByIdQueryConfig,
  getEntityRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/entity.query';

import type { EntityService, ServiceContext } from '../service.types';

export class EntityServiceImpl implements EntityService {
  async getEntityRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.entity.findMany({
        ...getEntityRegisterQueryConfig,
      });
    });

    // No filter because everyone can see entities
    return {
      entity: data,
    };
  }

  async getEntityById(ctx: ServiceContext, entityId: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.entity.findFirst({
        ...getEntityByIdQueryConfig,
        where: { Id: entityId },
      });
    });

    if (!data) {
      return null;
    }

    // No filter because everyone can see entities
    return data;
  }
}
