import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getAcceptanceAuditByIdQueryConfig,
  getActionAuditByIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/audit.query';
import { filter } from '@risksmart-app/permitio/src/permit';

import type { AuditService, ServiceContext } from '../service.types';

export class AuditServiceImpl implements AuditService {
  async getAcceptanceAuditById(ctx: ServiceContext, id: string) {
    const drizzle = await createDrizzleClient(ctx);
    const acceptanceAudit = await drizzle.org((tx) => {
      return tx.query.acceptance_audit.findMany({
        where: { Id: id },
        ...getAcceptanceAuditByIdQueryConfig,
        orderBy: (acceptance_audit, { desc }) => [
          desc(acceptance_audit.ModifiedAtTimestamp),
        ],
      });
    });

    const filteredAcceptanceData = await filter<(typeof acceptanceAudit)[0]>(
      acceptanceAudit,
      'rs_node',
      (entity: (typeof acceptanceAudit)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filteredAcceptanceData;
  }

  async getActionAuditById(ctx: ServiceContext, id: string) {
    const drizzle = await createDrizzleClient(ctx);
    const actionAudit = await drizzle.org((tx) => {
      return tx.query.action_audit.findMany({
        where: { Id: id },
        ...getActionAuditByIdQueryConfig,
        orderBy: (action_audit, { desc }) => [
          desc(action_audit.ModifiedAtTimestamp),
        ],
      });
    });

    const filteredActionData = await filter<(typeof actionAudit)[0]>(
      actionAudit,
      'rs_node',
      (entity: (typeof actionAudit)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filteredActionData;
  }
}

export const createAuditService = () => new AuditServiceImpl();
