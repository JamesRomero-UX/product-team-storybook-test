import { isApolloError } from '@apollo/client';
import type { WorkflowId } from '@risksmart-app/shared/approvals/workflows';

import type {
  ChangeRequestBoolExp,
  ChangeRequestForBackendPartsFragment,
} from '../../../generated/graphql';
import { ApprovalStatusEnum } from '../../../generated/graphql';
import { workflows } from '../../approval-workflows/workflows';
import type {
  CreateInput,
  UpdateInput,
} from '../../repositories/change-request/change-request.repository';
import { ChangeRequestRepository } from '../../repositories/change-request/change-request.repository';
import { ChangeRequestContributorRepository } from '../../repositories/change-request-contributor/change-request-contributor.repository';
import { ApprovalService } from '../approval/approval.service';
import type {
  Action,
  ActionParams,
  ApprovalWorkflowDefinition,
  WorkflowType,
} from '../approval/requireApprovalService';
import type { ServiceOptions } from '../types';
import { checkStatus } from './checkStatus';

export interface CreateChangeRequestInput {
  /** The ID of the workflow that the change request is associated with. */
  workflow: WorkflowId;
  /** The ID of the object which the approval is configured on (usually the parent ID) */
  approvalParentId: string;
  /** The ID of the object which is being changed */
  objectId: string;
  /** The changes that are being requested */
  changes: ActionParams;
  /** Optional rationale from the requester explaining why the change is needed */
  requesterComment?: string;
}

export const ChangeRequestService = (opts: ServiceOptions) => {
  const changeRequestRepo = ChangeRequestRepository(opts);
  const contributorRepo = ChangeRequestContributorRepository(opts);
  const approvalLevelService = ApprovalService(opts);

  return {
    async findActiveChangeRequest(
      parentId: string,
      workflowType: WorkflowType
    ) {
      const changeRequest = await changeRequestRepo.findWhere({
        ParentId: { _eq: parentId },
        ChangeRequestStatus: { _eq: ApprovalStatusEnum.Pending },
        Type: { _eq: workflowType },
      });
      if (!changeRequest[0]) {
        return null;
      }

      return changeRequest[0];
    },
    async delete(id: string | string[]) {
      await changeRequestRepo.delete({
        Id: { _in: Array.isArray(id) ? id : [id] },
      });
    },
    async findById(id: string) {
      const changeRequest = await changeRequestRepo.findWhere({
        Id: { _eq: id },
      });
      if (!changeRequest[0]) {
        throw new Error('Change request not found');
      }

      return changeRequest[0];
    },
    async amendChanges(
      changeRequest: ChangeRequestForBackendPartsFragment,
      userId: string,
      actionParams: ActionParams
    ) {
      await changeRequestRepo.update(
        {
          Id: { _eq: changeRequest.Id },
        },
        {
          ActionUserId: actionParams.userId,
          RequestedChanges: actionParams.data,
        }
      );
      if (changeRequest.CreatedByUser !== userId) {
        try {
          await contributorRepo.create({
            ChangeRequestId: changeRequest.Id,
            UserId: userId,
          });
        } catch (e) {
          if (!(e instanceof Error)) {
            throw e;
          }
          if (
            !(isApolloError(e) && e.message.includes('Uniqueness violation'))
          ) {
            throw e;
          }
        }
      }
    },
    async create(
      data: CreateChangeRequestInput | CreateChangeRequestInput[],
      workflowType: WorkflowType
    ) {
      const inputs = Array.isArray(data) ? data : [data];
      const approvers = await Promise.all(
        inputs.map((input) =>
          approvalLevelService.findApproversForParentApprovalObject(
            input.approvalParentId,
            input.workflow
          )
        )
      );

      const changeRequests: CreateInput = inputs.map((input, i) => ({
        ParentId: input.objectId,
        ChangeRequestStatus: ApprovalStatusEnum.Pending,
        ActionUserId: input.changes.userId,
        Type: workflowType,
        Workflow: input.workflow,
        RequestedChanges: input.changes.data,
        Comment: '',
        RequesterComment: input.requesterComment ?? null,
        responses: {
          data:
            approvers[i]?.map((approver) => ({
              ApproverId: approver.Id,
              Comment: '',
              Approved: null,
            })) ?? [],
        },
      }));

      const result = await changeRequestRepo.create(changeRequests);
      if (result.length < 1) {
        throw new Error('Change request not created');
      }

      return result;
    },
    getActiveLevelId(changeRequest: ChangeRequestForBackendPartsFragment) {
      const { activeLevelId } = checkStatus(changeRequest);

      return activeLevelId;
    },
    getWorkflow(
      changeRequest: ChangeRequestForBackendPartsFragment
    ): ApprovalWorkflowDefinition<Action> {
      const workflowId =
        changeRequest.Workflow ??
        changeRequest.responses?.[0]?.approver?.level?.approval?.Workflow;
      if (!workflowId) {
        throw new Error('Workflow not found');
      }
      const workflow = workflows[workflowId as keyof typeof workflows];
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      return workflow(opts.tenant);
    },
    async updateStatus(
      changeRequest: ChangeRequestForBackendPartsFragment,
      status: ApprovalStatusEnum,
      comment?: string,
      overriddenByUser?: string
    ) {
      const updateDocument: UpdateInput = {
        ChangeRequestStatus: status,
        Comment: comment,
      };

      const whereExp: ChangeRequestBoolExp = { Id: { _eq: changeRequest.Id } };

      if (status === ApprovalStatusEnum.Failed) {
        // Only allow setting a change request to failed when it is currently pending.
        // This is to prevent race conditions.
        whereExp.ChangeRequestStatus = { _eq: ApprovalStatusEnum.Pending };
      }

      if (overriddenByUser) {
        updateDocument.OverriddenByUser = overriddenByUser;
        updateDocument.OverriddenAtTimestamp = new Date().toISOString();
      }

      if (status !== changeRequest.ChangeRequestStatus) {
        await changeRequestRepo.update(whereExp, updateDocument);
      }

      return status;
    },
    async merge(changeRequest: ChangeRequestForBackendPartsFragment) {
      const workflow = this.getWorkflow(changeRequest);

      await workflow.action(opts.tenant)({
        id: changeRequest.ParentId,
        orgKey: changeRequest.OrgKey,
        userId: changeRequest.ActionUserId,
        data: changeRequest.RequestedChanges,
        changeRequestId: changeRequest.Id,
      });
    },
    async findContributors(changeRequestId: string) {
      return await contributorRepo.findWhere({
        Id: { _eq: changeRequestId },
      });
    },
  };
};
