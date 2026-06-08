import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from '../repositories/types';
import { AcceptanceService } from '../services/acceptance/acceptance.service';
import { requireApprovalService } from '../services/approval/requireApprovalService';

export default requireApprovalService({
  workflow: 'delete-acceptance',
  type: 'delete',
  action:
    (tenant) =>
    async ({ id, orgKey, userId }) => {
      const service = AcceptanceService({
        tenant,
        orgKey,
        userId,
        userRole: CUSTOMER_SUPPORT_ROLE,
      });

      return service.delete(id);
    },
  config: {
    approvalParentId:
      (tenant) =>
      async ({ id, orgKey }) => {
        const service = AcceptanceService({
          tenant,
          orgKey,
          userId: SYSTEM_USER,
          userRole: CUSTOMER_SUPPORT_ROLE,
        });
        const acceptance = await service.findById(id);

        return acceptance.parents.find((p) => !!p.risk)?.risk?.Id ?? '';
      },
  },
});
