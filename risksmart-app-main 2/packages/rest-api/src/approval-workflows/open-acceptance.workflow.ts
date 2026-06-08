import type { AcceptanceSetInput } from '../../generated/graphql';
import { AcceptanceStatusEnum } from '../../generated/graphql';
import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from '../repositories/types';
import { AcceptanceService } from '../services/acceptance/acceptance.service';
import { requireApprovalService } from '../services/approval/requireApprovalService';

export default requireApprovalService({
  workflow: 'open-acceptance',
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
      data: AcceptanceSetInput;
    }) => {
      const service = AcceptanceService({
        tenant,
        orgKey,
        userId,
        userRole: CUSTOMER_SUPPORT_ROLE,
      });

      return service.update(id, userId, data);
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
        const parent = (await service.findById(id)).parents.find(
          (p) => !!p?.risk
        );
        if (!parent?.risk) {
          return undefined;
        }

        return parent.risk.Id;
      },
    approvalCheck:
      (tenant) =>
      async ({ id, orgKey, data }) => {
        const service = AcceptanceService({
          tenant,
          orgKey,
          userId: SYSTEM_USER,
          userRole: CUSTOMER_SUPPORT_ROLE,
        });
        const current = await service.findById(id);

        return (
          current.Status !== data.Status &&
          data.Status === AcceptanceStatusEnum.Open
        );
      },
  },
});
