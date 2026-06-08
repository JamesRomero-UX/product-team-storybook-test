import { ParentTypeEnum } from '../../generated/graphql';
import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from '../repositories/types';
import { requireApprovalService } from '../services/approval/requireApprovalService';
import { IssueService } from '../services/issue/issue.service';

export default requireApprovalService({
  workflow: 'delete-issue',
  type: 'delete',
  action:
    (tenant) =>
    async ({ id, orgKey, userId }) => {
      const service = IssueService({
        tenant,
        orgKey,
        userId,
        userRole: CUSTOMER_SUPPORT_ROLE,
      });

      return service.delete(id);
    },
  config: {
    approvalCheck:
      (tenant) =>
      async ({ id, orgKey }) => {
        const service = IssueService({
          tenant,
          orgKey,
          userId: SYSTEM_USER,
          userRole: CUSTOMER_SUPPORT_ROLE,
        });
        const current = await service.findById(id);

        return current.Type === ParentTypeEnum.Issue;
      },
  },
});
