import { CUSTOMER_SUPPORT_ROLE } from '../repositories/types';
import { requireApprovalService } from '../services/approval/requireApprovalService';
import { RiskService } from '../services/risk/risk.service';

export default requireApprovalService({
  workflow: 'delete-risk',
  type: 'delete',
  action:
    (tenant) =>
    async ({
      id,
      orgKey,
      userId,
    }: {
      id: string;
      orgKey: string;
      userId: string;
    }) => {
      const service = RiskService({
        tenant,
        orgKey,
        userId,
        userRole: CUSTOMER_SUPPORT_ROLE,
      });

      return service.delete(id);
    },
  config: {},
});
