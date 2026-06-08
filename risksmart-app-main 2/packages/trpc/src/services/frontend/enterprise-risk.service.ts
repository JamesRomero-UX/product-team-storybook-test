import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getEnterpriseRiskByIdQueryConfig,
  getEnterpriseRiskByTierQueryConfig,
} from '@risksmart-app/drizzle/src/queries/enterprise-risk.query';
import { filter } from '@risksmart-app/permitio/src/permit';

import type { EnterpriseRiskService, ServiceContext } from '../service.types';
export class EnterpriseRiskServiceImpl implements EnterpriseRiskService {
  async getEnterpriseRisksRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    // Query enterprise risks with score relationship
    const data = await db.org((tx) => {
      return tx.query.enterprise_risk.findMany({
        with: {
          score: true, // Include score data (InherentScoreMean, ResidualScoreMean, etc.)
          createdByUser: true,
          modifiedByUser: true,
        },
      });
    });

    const filteredEnterpriseRisks = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity: (typeof data)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return {
      enterprise_risk: filteredEnterpriseRisks,
    };
  }

  async getEnterpriseRiskById(ctx: ServiceContext, enterpriseRiskId: string) {
    const db = await createDrizzleClient(ctx);

    // Query enterprise risk by ID with score relationship
    const data = await db.org((tx) => {
      return tx.query.enterprise_risk.findMany({
        where: { Id: enterpriseRiskId },
        ...getEnterpriseRiskByIdQueryConfig,
      });
    });

    const filteredEnterpriseRisks = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity: (typeof data)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filteredEnterpriseRisks;
  }

  async getEnterpriseRiskByTier(ctx: ServiceContext, tier: number) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.enterprise_risk.findMany({
        where: { Tier: tier },
        ...getEnterpriseRiskByTierQueryConfig,
      });
    });

    const filteredEnterpriseRisks = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity: (typeof data)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filteredEnterpriseRisks;
  }
}
