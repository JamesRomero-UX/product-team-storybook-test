import { compare } from 'src/comparators/controlComparator';
import type { UpdateByPkInput } from 'src/repositories/control/control.repository';
import { ControlService } from 'src/services/control/control.service';

import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from '../repositories/types';
import { requireApprovalService } from '../services/approval/requireApprovalService';

export default requireApprovalService({
  workflow: 'update-control-details',
  type: 'update',
  action:
    (tenant) =>
    async ({
      id,
      orgKey,
      userId,
      data,
    }: {
      id: string;
      orgKey: string;
      userId: string;
      data: UpdateByPkInput;
    }) => {
      const service = ControlService({
        tenant,
        orgKey,
        userId,
        userRole: CUSTOMER_SUPPORT_ROLE,
      });

      return service.updateByPk(id, data);
    },
  config: {
    approvalCheck:
      (tenant) =>
      async ({ id, orgKey, data }) => {
        const service = ControlService({
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
