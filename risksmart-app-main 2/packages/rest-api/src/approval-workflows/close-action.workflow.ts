import { ActionStatusEnum, ParentTypeEnum } from 'generated/graphql';
import type { UpdateByPkInput } from 'src/repositories/action/action.repository';
import { getUpdatedFiles } from 'src/services/relation-file/relationFileService';

import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from '../repositories/types';
import { ActionService } from '../services/action/action.service';
import { requireApprovalService } from '../services/approval/requireApprovalService';

export default requireApprovalService({
  workflow: 'close-action',
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
      async ({ id, orgKey, data }) => {
        const service = ActionService({
          tenant,
          orgKey,
          userId: SYSTEM_USER,
          userRole: CUSTOMER_SUPPORT_ROLE,
        });
        const current = await service.findById(id);

        return (
          current.Status !== data.Status &&
          data.Status === ActionStatusEnum.Closed
        );
      },
  },
});
