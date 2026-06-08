import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { bulkCheck } from '@risksmart-app/permitio/src/permit';

import type { ColourPaletteService, ServiceContext } from '../service.types';

export class ColourPaletteServiceImpl implements ColourPaletteService {
  async getColourPalettes(ctx: ServiceContext) {
    const result = await bulkCheck(
      [
        {
          resourceName: `colour_palette`,
          action: 'read',
        },
      ],
      ctx.userId,
      ctx.orgId
    );

    if (!result || result.length === 0) {
      return [];
    }

    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.colour_palette.findMany({
        orderBy: (t, { desc }) => [desc(t.CreatedAtTimestamp)],
        limit: 1,
      })
    );

    return data;
  }
}
