import { CUSTOMER_SUPPORT_ROLE } from '../repositories/types';
import { ActionService } from '../services/action/action.service';
import { requireApprovalService } from '../services/approval/requireApprovalService';

export default requireApprovalService({
  workflow: 'delete-action',
  type: 'delete',
  action:
    (tenant) =>
    async ({ id, orgKey, userId }) => {
      const service = ActionService({
        tenant,
        orgKey,
        userId,
        userRole: CUSTOMER_SUPPORT_ROLE,
      });

      return service.delete(id);
    },
  config: {},
});
