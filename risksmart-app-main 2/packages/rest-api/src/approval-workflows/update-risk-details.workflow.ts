import { compare } from 'src/comparators/riskComparator';
import type { UpdateInput } from 'src/repositories/risk/risk.repository';
import { RiskService } from 'src/services/risk/risk.service';

import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from '../repositories/types';
import { requireApprovalService } from '../services/approval/requireApprovalService';

export default requireApprovalService({
  workflow: 'update-risk-details',
  type: 'update',
  action:
    (tenant) =>
    async ({
      orgKey,
      userId,
      data,
    }: {
      id: string;
      orgKey: string;
      userId: string;
      data: UpdateInput;
    }) => {
      const service = RiskService({
        tenant,
        orgKey,
        userId,
        userRole: CUSTOMER_SUPPORT_ROLE,
      });

      return service.update(data);
    },
  config: {
    approvalCheck:
      (tenant) =>
      async ({ id, orgKey, data }) => {
        const service = RiskService({
          tenant,
          orgKey,
          userId: SYSTEM_USER,
          userRole: CUSTOMER_SUPPORT_ROLE,
        });

        const current = await service.findById(id);

        return compare(current, data);
      },
  },
});
