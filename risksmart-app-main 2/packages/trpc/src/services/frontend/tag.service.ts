import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';

import type { ServiceContext, TagService } from '../service.types';

export class TagServiceImpl implements TagService {
  async getTags(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    // Query tag types with comprehensive relationships
    const data = await db.org((tx) => {
      return tx.query.tag_type.findMany({
        with: {
          createdByUser: true,
          modifiedByUser: true,
          tag_type_group: true,
        },
      });
    });

    return data;
  }
}
