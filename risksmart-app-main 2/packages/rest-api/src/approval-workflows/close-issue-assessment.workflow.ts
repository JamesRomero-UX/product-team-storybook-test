import { IssueAssessmentStatusEnum, ParentTypeEnum } from 'generated/graphql';
import type { UpdateInput } from 'src/repositories/issue-assessment/issue-assessment.repository';

import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from '../repositories/types';
import { requireApprovalService } from '../services/approval/requireApprovalService';
import { IssueAssessmentService } from '../services/issue-assessment/issue-assessment.service';

export default requireApprovalService({
  workflow: 'close-issue-assessment',
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
      data: UpdateInput;
    }) => {
      const service = IssueAssessmentService({
        tenant,
        orgKey,
        userId,
        userRole: CUSTOMER_SUPPORT_ROLE,
      });

      return service.update(id, userId, data);
    },
  config: {
    approvalCheck:
      (tenant) =>
      async ({ id, orgKey, data }) => {
        const service = IssueAssessmentService({
          tenant,
          orgKey,
          userId: SYSTEM_USER,
          userRole: CUSTOMER_SUPPORT_ROLE,
        });
        const current = await service.findById(id);

        return (
          current.Status !== data.Status &&
          data.Status === IssueAssessmentStatusEnum.Closed &&
          current.Type === ParentTypeEnum.IssueAssessment
        );
      },
  },
});
