import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getIssueUpdateAuditByIdQueryConfig } from '@risksmart-app/drizzle/src/queries/issue-update-audit.query';
import { filter } from '@risksmart-app/permitio/src/permit';

import type { GetIssueUpdateAuditByIdResponseRow } from '../../types/issue-update-audit.types';
import type { IssueUpdateAuditService, ServiceContext } from '../service.types';

export class IssueUpdateAuditServiceImpl implements IssueUpdateAuditService {
  async getIssueUpdateAuditById(ctx: ServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);
    const data = await db.org((tx) => {
      return tx.query.issue_update_audit.findMany({
        where: {
          Id: id,
        },
        ...getIssueUpdateAuditByIdQueryConfig,
      });
    });

    const filteredIssues = await filter<GetIssueUpdateAuditByIdResponseRow>(
      data,
      'rs_node',
      (entity: GetIssueUpdateAuditByIdResponseRow) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filteredIssues;
  }
}
