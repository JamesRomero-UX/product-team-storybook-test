import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getGlobalApprovalsQueryConfig } from '@risksmart-app/drizzle/src/queries/approval.query';
import { filter } from '@risksmart-app/permitio/src/permit';

import type { ApprovalResponseRow } from '../../types/index';
import type { ApprovalService, ServiceContext } from '../service.types';

export class ApprovalServiceImpl implements ApprovalService {
  async getGlobalApprovals(
    ctx: ServiceContext,
    isGlobal = true,
    parentId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.approval.findMany({
        where: {
          OR: [
            {
              AND: [
                { ParentId: isGlobal ? { isNull: true } : { isNotNull: true } },
                {
                  NOT: {
                    Workflow: isGlobal ? { isNull: true } : { isNotNull: true },
                  },
                },
              ],
            },
            { ParentId: parentId },
          ],
        },
        ...getGlobalApprovalsQueryConfig,
      });
    });

    const parentlessApprovals = data.filter((app) => !app.ParentId);

    const parentedApprovals = data.filter((app) => app.ParentId);

    const filteredApprovals = await filter<ApprovalResponseRow>(
      parentedApprovals,
      'rs_node',
      (entity: ApprovalResponseRow) => entity.ParentId!,
      ctx.userId,
      ctx.orgId
    );

    return [...parentlessApprovals, ...filteredApprovals];
  }
}
