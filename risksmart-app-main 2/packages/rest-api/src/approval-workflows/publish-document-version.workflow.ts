import type { DocumentFileSetInput } from '../../generated/graphql';
import { VersionStatusEnum } from '../../generated/graphql';
import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from '../repositories/types';
import { requireApprovalService } from '../services/approval/requireApprovalService';
import { DocumentVersionService } from '../services/document-version/document-version.service';

export default requireApprovalService({
  workflow: 'publish-document-version',
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
      data: DocumentFileSetInput;
    }) => {
      const service = DocumentVersionService({
        tenant,
        orgKey,
        userId,
        userRole: CUSTOMER_SUPPORT_ROLE,
      });

      const current = await service.findById(id);

      if (
        current.Status !== data.Status &&
        data.Status === VersionStatusEnum.Published
      ) {
        return service.update(id, userId, {
          ...data,
          PublishedDate: new Date().toISOString(),
        });
      } else {
        return service.update(id, userId, data);
      }
    },
  config: {
    approvalParentId:
      (tenant) =>
      async ({ id, orgKey }) => {
        const service = DocumentVersionService({
          tenant,
          orgKey,
          userId: SYSTEM_USER,
          userRole: CUSTOMER_SUPPORT_ROLE,
        });

        return (await service.findById(id)).ParentDocumentId;
      },
    approvalCheck:
      (tenant) =>
      async ({ id, orgKey, data }) => {
        const service = DocumentVersionService({
          tenant,
          orgKey,
          userId: SYSTEM_USER,
          userRole: CUSTOMER_SUPPORT_ROLE,
        });
        const current = await service.findById(id);

        return (
          current.Status !== data.Status &&
          data.Status === VersionStatusEnum.Published
        );
      },
  },
});
