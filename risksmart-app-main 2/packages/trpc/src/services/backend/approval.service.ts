import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getApprovalByIdConfig } from '@risksmart-app/drizzle/src/queries/approval.query';

import type {
  ApprovalBackendService,
  BackendServiceContext,
} from '../service.types';

export class ApprovalServiceImpl implements ApprovalBackendService {
  async getApprovalById(ctx: BackendServiceContext, approvalId: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const data = await tx.query.approval.findFirst({
        ...getApprovalByIdConfig,
        where: { Id: approvalId },
      });

      return data ? { approval: data, form_configuration: null } : null;
    });
  }
}
