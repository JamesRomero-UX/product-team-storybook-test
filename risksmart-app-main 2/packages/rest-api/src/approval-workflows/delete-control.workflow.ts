import { CUSTOMER_SUPPORT_ROLE } from '../repositories/types';
import { requireApprovalService } from '../services/approval/requireApprovalService';
import { ControlService } from '../services/control/control.service';

export default requireApprovalService({
  workflow: 'delete-control',
  type: 'delete',
  action:
    (tenant) =>
    async ({ id, orgKey, userId }) => {
      const service = ControlService({
        tenant,
        orgKey,
        userId,
        userRole: CUSTOMER_SUPPORT_ROLE,
      });

      return service.delete(id);
    },
  config: {},
});
