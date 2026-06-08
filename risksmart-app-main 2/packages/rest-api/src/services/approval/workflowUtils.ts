import type { WorkflowId } from '@risksmart-app/shared/approvals/workflows';
import { Unauthorized } from 'http-errors';
import { getSessionData } from 'src/session';

import type { ChangeRequestForBackendPartsFragment } from '../../../generated/graphql';
import { ApprovalInFlightEditRuleEnum } from '../../../generated/graphql';
import type { ActionInput } from '../../hasuraActionHelpers';
import { getLogger } from '../../logger';
import { CUSTOMER_SUPPORT_ROLE } from '../../repositories/types';
import type { CreateChangeRequestInput } from '../change-request/change-request.service';
import { ChangeRequestService } from '../change-request/change-request.service';
import { NodeService } from '../node/node.service';
import { ApprovalService } from './approval.service';
import type {
  ActionParams,
  RequireApprovalConfig,
  WorkflowType,
} from './requireApprovalService';
const logger = getLogger();
export class ChangeRequestConfirmationRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChangeRequestConfirmationRequiredError';
    this.message = message;
    Object.setPrototypeOf(
      this,
      ChangeRequestConfirmationRequiredError.prototype
    );
  }
}

export type WorkflowCheckResult = (
  | {
      result: 'success';
      data: ActionParams;
    }
  | {
      result: 'change-request-required';
      data: {
        data: CreateChangeRequestInput;
        type: WorkflowType;
        config: RequireApprovalConfig;
      };
    }
  | {
      result: 'amend-change-request';
      data: {
        changeRequest: ChangeRequestForBackendPartsFragment;
        userId: string;
        changes: ActionParams;
        approvalConfig: RequireApprovalConfig;
      };
    }
) & {
  extra?: {
    deleteChangeRequestId?: string;
  };
};

const everyoneWithAccessCanEdit = (
  activeLevel: {
    approval?: { InFlightEditRule: ApprovalInFlightEditRuleEnum } | null;
  } | null
) =>
  activeLevel?.approval?.InFlightEditRule ===
  ApprovalInFlightEditRuleEnum.Everyone;

const onlyApproversCanEditAndUserIsAnApprover = (
  activeLevel: {
    approval?: { InFlightEditRule: ApprovalInFlightEditRuleEnum } | null;
    approvers: {
      Id: string;
      UserId?: string | null | undefined;
      UserGroupId?: string | null | undefined;
      OwnerApprover?: boolean | null | undefined;
      group?:
        | {
            users: {
              UserId: string;
            }[];
          }
        | null
        | undefined;
    }[];
  } | null,
  userId: string,
  owners: { UserId?: string | null }[]
) =>
  activeLevel?.approval?.InFlightEditRule ===
    ApprovalInFlightEditRuleEnum.Approvers &&
  activeLevel.approvers.some(
    (approver) =>
      approver.UserId === userId ||
      approver.group?.users.some((g) => g.UserId === userId) ||
      (approver.OwnerApprover && owners.map((o) => o.UserId).includes(userId))
  );

export const checkWorkflow = async ({
  tenant,
  request,
  config,
  workflow,
  type,
  actionParams,
  force,
}: {
  tenant: string;
  request: ActionInput<unknown>;
  config: RequireApprovalConfig;
  workflow: WorkflowId;
  type: WorkflowType;
  actionParams: ActionParams;
  force?: boolean;
}): Promise<WorkflowCheckResult> => {
  const sessionData = getSessionData(request.session_variables);
  const extra = {} as NonNullable<WorkflowCheckResult['extra']>;

  const changeRequestService = ChangeRequestService({
    tenant,
    orgKey: sessionData.orgKey,
    userId: sessionData.userId,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });
  const approvalLevelService = ApprovalService({
    tenant,
    orgKey: sessionData.orgKey,
    userId: sessionData.userId,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });
  const nodeService = NodeService({
    tenant,
    orgKey: sessionData.orgKey,
    userId: sessionData.userId,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  const objectId = actionParams.id;
  const approvalParentId = config.approvalParentId
    ? await config.approvalParentId(tenant)(actionParams)
    : actionParams.id;
  if (!approvalParentId) {
    logger.info(
      'Approval parent id not found. This can be due to object being orphaned, hance no approval config to check'
    );

    return {
      result: 'success',
      data: actionParams,
      extra,
    };
  }

  const owners = await nodeService.findObjectOwners(approvalParentId);

  const levels = await approvalLevelService.findLevelsForObject(
    approvalParentId,
    workflow
  );

  logger.info('Checking for existing change request');

  const existingChangeRequest =
    await changeRequestService.findActiveChangeRequest(objectId, type);

  if (existingChangeRequest !== null) {
    const activeLevelId = changeRequestService.getActiveLevelId(
      existingChangeRequest
    );
    const activeLevel = levels.find((level) => level.Id === activeLevelId);
    if (!activeLevel) {
      logger.error(
        "Active level doesn't exist for pending change request (this shouldn't exist)"
      );
      extra.deleteChangeRequestId = existingChangeRequest.Id;
    } else if (
      everyoneWithAccessCanEdit(activeLevel) ||
      onlyApproversCanEditAndUserIsAnApprover(
        activeLevel,
        sessionData.userId,
        owners
      )
    ) {
      return {
        result: 'amend-change-request',
        data: {
          userId: sessionData.userId,
          changeRequest: existingChangeRequest,
          changes: actionParams,
          approvalConfig: config,
        },
        extra,
      };
    } else {
      throw new Unauthorized(
        'You cannot edit this object while a change request is in progress'
      );
    }
  }

  const confirmation =
    request.event.headers['x-confirm-change-request'] === 'true' || force;

  const hasFileChanges = request.event.headers['x-has-file-changes'] === 'true';

  const MAX_REQUESTER_COMMENT_LENGTH = 2000;
  let requesterComment: string | undefined;
  try {
    const raw = request.event.headers['x-requester-comment'];
    requesterComment = raw
      ? decodeURIComponent(raw).slice(0, MAX_REQUESTER_COMMENT_LENGTH)
      : undefined;
  } catch {
    requesterComment = undefined;
  }

  const autoApprove = levels.length < 1;

  if (
    !config?.approvalCheck ||
    (await config.approvalCheck(tenant)(actionParams, hasFileChanges))
  ) {
    if (!confirmation) {
      if (!autoApprove) {
        throw new ChangeRequestConfirmationRequiredError(
          'You need to create a change request to perform this action.'
        );
      }
    } else if (!autoApprove) {
      return {
        result: 'change-request-required',
        data: {
          data: {
            workflow,
            approvalParentId,
            objectId,
            changes: actionParams,
            requesterComment,
          },
          type,
          config,
        },
        extra,
      };
    }
  }

  return {
    result: 'success',
    data: actionParams,
    extra,
  };
};
