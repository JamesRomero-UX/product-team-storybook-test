import { OrderBy } from '../../../generated/graphql';
import { ApprovalLevelRepository } from '../../repositories/approval/approval-level.repository';
import { isOrgModuleEnabled } from '../orgUtilities';
import type { ServiceOptions } from '../types';

export const ApprovalService = (opts: ServiceOptions) => {
  const approvalLevelRepo = ApprovalLevelRepository(opts);

  return {
    async enabledForOrg() {
      return isOrgModuleEnabled(
        { orgKey: opts.orgKey, tenant: opts.tenant },
        'approval'
      );
    },
    async findLevelsForObject(objectId: string, workflow: string) {
      return approvalLevelRepo.findWhere(
        {
          approval: {
            _or: [
              {
                Workflow: { _eq: workflow },
                ParentId: { _is_null: true },
              },
              {
                Workflow: { _eq: workflow },
                ParentId: { _eq: objectId },
              },
            ],
          },
        },
        {
          orderBy: [
            { approval: { ParentId: OrderBy.Asc } },
            { SequenceOrder: OrderBy.Asc },
          ],
        }
      );
    },
    async findApproversForParentApprovalObject(
      objectId: string,
      workflow: string
    ) {
      const levels = await this.findLevelsForObject(objectId, workflow);

      return levels.flatMap((level) => level.approvers);
    },
  };
};
