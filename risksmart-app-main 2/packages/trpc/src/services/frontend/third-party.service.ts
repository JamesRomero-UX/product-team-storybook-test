import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getThirdPartiesQueryConfig,
  getThirdPartyByIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/third-party.query';
import { filter } from '@risksmart-app/permitio/src/permit';

import type {
  ThirdPartyResponseRow,
  ThirdPartyWithFilesResponseRow,
} from '../../types/index';
import type { ServiceContext, ThirdPartyService } from '../service.types';

export class ThirdPartyServiceImpl implements ThirdPartyService {
  async getThirdPartiesRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    // Query third parties with comprehensive relationships
    const data = await db.org((tx) => {
      return tx.query.third_party.findMany({
        ...getThirdPartiesQueryConfig,
      });
    });

    const filteredThirdParties = await filter<ThirdPartyResponseRow>(
      data,
      'rs_node',
      (entity: ThirdPartyResponseRow) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return {
      third_party: filteredThirdParties,
    };
  }

  async getThirdPartyById(
    ctx: ServiceContext,
    thirdPartyId: string
  ): Promise<ThirdPartyWithFilesResponseRow> {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.third_party.findFirst({
        where: { Id: thirdPartyId },
        ...getThirdPartyByIdQueryConfig,
      });
    });

    if (!data) {
      throw new Error('Third party not found');
    }

    const [filteredThirdParty] = await filter<ThirdPartyWithFilesResponseRow>(
      [data],
      'rs_node',
      (entity: ThirdPartyWithFilesResponseRow) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    if (!filteredThirdParty) {
      throw new Error('Access to third party is denied');
    }

    return filteredThirdParty;
  }
}
