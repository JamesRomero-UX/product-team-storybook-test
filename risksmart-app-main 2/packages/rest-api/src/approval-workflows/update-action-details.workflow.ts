import { ParentTypeEnum } from 'generated/graphql';
import { compare } from 'src/comparators/actionComparator';
import type { UpdateByPkInput } from 'src/repositories/action/action.repository';
import { ActionService } from 'src/services/action/action.service';
import { getUpdatedFiles } from 'src/services/relation-file/relationFileService';

import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from '../repositories/types';
import { requireApprovalService } from '../services/approval/requireApprovalService';

export default requireApprovalService({
  workflow: 'update-action-details',
  type: 'update',
  action:
    (tenant) =>
    async ({
      id,
      orgKey,
      userId,
      data,
      changeRequestId,
    }: {
      id: string;
      orgKey: string;
      userId: string;
      data: UpdateByPkInput;
      changeRequestId?: string;
    }) => {
      const actionService = ActionService({
        tenant,
        orgKey,
        userId,
        userRole: CUSTOMER_SUPPORT_ROLE,
      });

      const { addedFiles, deletedFiles } = await getUpdatedFiles(
        tenant,
        orgKey,
        userId,
        changeRequestId
      );

      return actionService.updateWithFiles(
        id,
        data,
        addedFiles.map((file) => ({
          ParentId: id,
          ParentType: ParentTypeEnum.Action,
          FileId: file.FileId,
        })),
        deletedFiles.map((file) => file.FileId)
      );
    },
  config: {
    approvalCheck:
      (tenant) =>
      async ({ id, orgKey, data }, hasFileChanges = false) => {
        const actionService = ActionService({
          tenant,
          orgKey,
          userId: SYSTEM_USER,
          userRole: CUSTOMER_SUPPORT_ROLE,
        });
        const current = await actionService.findById(id);

        return compare(current, data) || hasFileChanges;
      },
  },
});
