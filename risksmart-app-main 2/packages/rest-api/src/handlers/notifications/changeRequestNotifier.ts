import type { Logger } from '@aws-lambda-powertools/logger';
import { getFriendlyId } from '@risksmart-app/shared/friendlyId';
import type { EventBridgeEvent } from 'aws-lambda';
import { eventBridgeEventHandler } from 'src/eventBridgeHandler';
import { getLogger } from 'src/logger';
import type { ActionParams } from 'src/services/approval/requireApprovalService';
import type { SessionData } from 'src/session';
import { getSessionData } from 'src/session';

import type {
  ApproverResponse,
  ChangeRequestForBackendPartsFragment,
} from '../../../generated/graphql';
import { ApprovalStatusEnum, ParentTypeEnum } from '../../../generated/graphql';
import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from '../../repositories/types';
import { ChangeRequestService } from '../../services/change-request/change-request.service';
import { checkStatus } from '../../services/change-request/checkStatus';
import { NodeService } from '../../services/node/node.service';
import { isNotificationsEnabled } from '../../services/orgUtilities';
import type { DataChangeEvent } from '../events/DataChangeEvent';
import type { NotificationObject } from './utilities';
import {
  checkEventAndEnvironmentStatus,
  createNotificationObject,
  sendNotifications,
} from './utilities';
const logger = getLogger();

const getParentTitle = (
  logger: Logger,
  changeRequest: ChangeRequestForBackendPartsFragment
) => {
  if (changeRequest.parent?.risk) {
    return changeRequest.parent.risk.Title;
  }

  if (changeRequest.parent?.control) {
    return changeRequest.parent.control.Title;
  }

  if (changeRequest.parent?.action) {
    return changeRequest.parent.action.Title;
  }

  if (changeRequest.parent?.documentFile) {
    return `${changeRequest.parent.documentFile.parent?.Title} - ${changeRequest.parent.documentFile.Version}`;
  }

  if (changeRequest.parent?.issue) {
    return changeRequest.parent.issue.Title;
  }

  if (
    changeRequest.parent?.issue_assessment &&
    changeRequest.parent.issue_assessment.parent
  ) {
    return changeRequest.parent.issue_assessment.parent.Title;
  }

  if (changeRequest.parent?.acceptance) {
    return changeRequest.parent.acceptance.Title;
  }
  logger.warn('Title not found');

  return;
};

const getParentUrl = (
  logger: Logger,
  changeRequest: ChangeRequestForBackendPartsFragment
) => {
  switch (changeRequest.parent?.ObjectType) {
    case ParentTypeEnum.DocumentFile:
      if (changeRequest.parent.documentFile?.parent) {
        return `/policy/${changeRequest.parent.documentFile.parent.Id}/files/update/${changeRequest.ParentId}`;
      }
      break;
    case ParentTypeEnum.IssueAssessment:
      if (changeRequest.parent.issue_assessment?.parent) {
        return `/issues/${changeRequest.parent.issue_assessment.parent.Id}/assessment`;
      }
      break;
    case ParentTypeEnum.Issue:
      return `/issues/${changeRequest.ParentId}`;
    case ParentTypeEnum.Control:
      return `/controls/${changeRequest.ParentId}`;
    case ParentTypeEnum.Risk:
      return `/risks/${changeRequest.ParentId}`;
    case ParentTypeEnum.Action:
      return `/actions/${changeRequest.ParentId}`;
    case ParentTypeEnum.Acceptance:
      return `/acceptances/${changeRequest.ParentId}`;
    default:
      logger.warn('parent URL not found');
  }
};

export const handler = eventBridgeEventHandler<
  string,
  DataChangeEvent<ApproverResponse, 'approver_response'>,
  void
>(async (e) => {
  const sessionData = getSessionData(e.detail.event?.session_variables);
  logger.appendKeys({
    ...sessionData,
  });
  const changeRequestId = e.detail.event.data.new?.ChangeRequestId;
  const childLogger = logger.createChild({
    persistentKeys: {
      tenant: sessionData.tenant,
      changeRequestId: changeRequestId,
      approverResponseId: e.detail.event.data.new?.Id,
    },
  });
  childLogger.info('Approver response changed. Processing notifications...');
  if (!changeRequestId) {
    childLogger.warn('No change request ID. Ending.');

    return;
  }
  const changeRequestService = ChangeRequestService({
    tenant: sessionData.tenant,
    orgKey: sessionData.orgKey,
    userId: SYSTEM_USER,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  const changeRequest = await changeRequestService.findById(changeRequestId);

  if (!changeRequest) {
    throw new Error('Change request not found');
  }

  const activeLevelId = changeRequestService.getActiveLevelId(changeRequest);
  const { status } = checkStatus(changeRequest);

  // Handle rejection notifications
  if (!activeLevelId && status === ApprovalStatusEnum.Rejected) {
    childLogger.info(
      'Change request rejected. Sending rejection notifications...'
    );
    await handleRejectionNotifications(changeRequest, sessionData, childLogger);
    childLogger.info('Rejection notifications sent. Complete.');

    return;
  }

  if (!activeLevelId) {
    childLogger.warn('No active level ID. Ending.');

    return;
  }

  const workflow = changeRequestService.getWorkflow(changeRequest);
  const actionParams: ActionParams = {
    id: changeRequest.ParentId,
    orgKey: changeRequest.OrgKey,
    userId: changeRequest.ActionUserId,
    data: changeRequest.RequestedChanges,
  };
  const approvalParentId = workflow.config.approvalParentId
    ? await workflow.config.approvalParentId(sessionData.tenant)(actionParams)
    : actionParams.id;
  if (!approvalParentId) {
    logger.info(
      "Cannot send notifications as approval parent not found. This can be caused by orphaned items that don't have there own approval config."
    );

    return;
  }

  childLogger.info('Sending approver notifications for parent: ', {
    parentId: changeRequest.ParentId,
  });

  checkEventAndEnvironmentStatus(e, ['approver_response']);

  let messageObject = createNotificationObject(sessionData);

  messageObject = processChangeRequestObject(
    changeRequest,
    changeRequest.ParentId,
    messageObject
  );
  messageObject.IdempotencyKey = `${messageObject.WorkflowKey}-${messageObject.Id}-${activeLevelId}-${messageObject.TimeStamp}`;

  if (changeRequest.parent && changeRequest.ParentId) {
    messageObject.ParentTitle = getParentTitle(logger, changeRequest);
    messageObject.ParentSequenceId = getFriendlyId(
      changeRequest.parent?.ObjectType,
      changeRequest.parent?.SequentialId
    );
    messageObject.ParentId = changeRequest.ParentId;
    messageObject.ParentUrl = getParentUrl(logger, changeRequest)
      ? `${getParentUrl(logger, changeRequest)}?showRequest=true&requestId=${
          changeRequest.Id
        }`
      : '#';
  }

  if (!(await isNotificationsEnabled(messageObject))) {
    childLogger.info('Notifications disabled. Ending.');

    return;
  }
  childLogger.info('Getting extra recipients');
  const extraRecipients = await getExtraRecipients({
    responses: changeRequest.responses,
    activeLevelId,
    approvalParentId,
    sessionData,
  });
  childLogger.info('Sending notifications');
  await sendNotifications(messageObject, {
    // @ts-ignore - we filter recipients above to ensure the UserId is present
    extraRecipients,
    excludeOwners: true,
    excludeContributors: true,
    extraData: {
      ...(changeRequest.RequesterComment
        ? { requesterComment: changeRequest.RequesterComment }
        : {}),
    },
  });
  childLogger.info('Complete');
});

const getExtraRecipients = async ({
  responses,
  activeLevelId,
  approvalParentId,
  sessionData,
}: {
  responses: ChangeRequestForBackendPartsFragment['responses'];
  activeLevelId: string;
  approvalParentId: string;
  sessionData: SessionData;
}) => {
  const nodeService = NodeService({
    tenant: sessionData.tenant,
    orgKey: sessionData.orgKey,
    userId: SYSTEM_USER,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  const owners = await nodeService.findObjectOwners(approvalParentId);
  const approvers = responses
    .filter((response) => response.approver.level?.Id === activeLevelId)
    .map((response) => response.approver);

  return [
    // Users
    ...approvers
      .filter((approver) => !!approver.user)
      .map((approver) => ({
        id: approver.user!.Id,
        email: approver.user!.Email,
        name: approver.user!.UserName,
      })),
    // Groups
    ...approvers
      .filter((approver) => !!approver.group)
      .flatMap((approver) => approver.group?.users ?? [])
      .map((user) => ({
        id: user.authUsers.Id,
        email: user.authUsers.Email,
        name: user.authUsers.UserName,
      })),
    // Owners
    ...(approvers.some((a) => a.OwnerApprover)
      ? [
          ...(owners
            .filter((owner) => !!owner.UserId)
            .map(({ UserId, user }) => ({
              id: UserId,
              name: user?.UserName,
              email: user?.Email,
            })) ?? []),
        ]
      : []),
  ];
};

const processChangeRequestObject = (
  changeRequest: ChangeRequestForBackendPartsFragment,
  parentId: string,
  messageObject: NotificationObject
): NotificationObject => {
  messageObject.Id = parentId;
  messageObject.TimeStamp = changeRequest.CreatedAtTimestamp;
  messageObject.OrgKey = changeRequest.OrgKey;
  messageObject.Actor = changeRequest.CreatedByUser ?? '';
  messageObject.WorkflowKey = 'change-request-insert';
  messageObject.Title = 'Change Request';
  messageObject.SequenceId = changeRequest.SequentialId ?? '';

  return messageObject;
};

const handleRejectionNotifications = async (
  changeRequest: ChangeRequestForBackendPartsFragment,
  sessionData: SessionData,
  logger: Logger
) => {
  const changeRequestService = ChangeRequestService({
    tenant: sessionData.tenant,
    orgKey: sessionData.orgKey,
    userId: SYSTEM_USER,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  const workflow = changeRequestService.getWorkflow(changeRequest);
  const actionParams: ActionParams = {
    id: changeRequest.ParentId,
    orgKey: changeRequest.OrgKey,
    userId: changeRequest.ActionUserId,
    data: changeRequest.RequestedChanges,
  };
  const approvalParentId = workflow.config.approvalParentId
    ? await workflow.config.approvalParentId(sessionData.tenant)(actionParams)
    : actionParams.id;

  if (!approvalParentId) {
    logger.info(
      "Cannot send rejection notifications as approval parent not found. This can be caused by orphaned items that don't have there own approval config."
    );

    return;
  }

  checkEventAndEnvironmentStatus(
    {
      detail: {
        event: {
          session_variables: sessionData,
          trace_context: null,
          data: { new: null, old: null },
          op: 'UPDATE' as const,
        },
        table: { name: 'approver_response', schema: 'public' },
      },
    } as unknown as EventBridgeEvent<string, DataChangeEvent<unknown, string>>,
    ['approver_response']
  );

  let messageObject = createNotificationObject(sessionData);

  messageObject = processChangeRequestRejectedObject(
    changeRequest,
    changeRequest.ParentId,
    messageObject
  );
  messageObject.IdempotencyKey = `${messageObject.WorkflowKey}-${messageObject.Id}-rejected-${messageObject.TimeStamp}`;

  if (changeRequest.parent && changeRequest.ParentId) {
    messageObject.ParentTitle = getParentTitle(logger, changeRequest);
    messageObject.ParentSequenceId = getFriendlyId(
      changeRequest.parent?.ObjectType,
      changeRequest.parent?.SequentialId
    );
    messageObject.ParentId = changeRequest.ParentId;
    messageObject.ParentUrl = getParentUrl(logger, changeRequest)
      ? `${getParentUrl(logger, changeRequest)}?showRequest=true&requestId=${
          changeRequest.Id
        }`
      : '#';
  }

  if (!(await isNotificationsEnabled(messageObject))) {
    logger.info('Rejection notifications disabled. Ending.');

    return;
  }

  logger.info('Getting rejection notification recipients');
  const rejectionRecipients = await getRejectionRecipients({
    changeRequest,
    approvalParentId,
    sessionData,
  });

  logger.info('Sending rejection notifications');
  await sendNotifications(messageObject, {
    extraRecipients: rejectionRecipients,
    excludeOwners: false,
    excludeContributors: false,
  });
};

const processChangeRequestRejectedObject = (
  changeRequest: ChangeRequestForBackendPartsFragment,
  parentId: string,
  messageObject: NotificationObject
): NotificationObject => {
  messageObject.Id = parentId;
  messageObject.TimeStamp = changeRequest.CreatedAtTimestamp;
  messageObject.OrgKey = changeRequest.OrgKey;
  messageObject.Actor = changeRequest.CreatedByUser ?? '';
  messageObject.WorkflowKey = 'change-request-rejected';
  messageObject.Title = 'Change Request Rejected';
  messageObject.SequenceId = changeRequest.SequentialId ?? '';

  return messageObject;
};

const getRejectionRecipients = async ({
  changeRequest,
  approvalParentId,
  sessionData,
}: {
  changeRequest: ChangeRequestForBackendPartsFragment;
  approvalParentId: string;
  sessionData: SessionData;
}) => {
  const changeRequestService = ChangeRequestService({
    tenant: sessionData.tenant,
    orgKey: sessionData.orgKey,
    userId: SYSTEM_USER,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  const nodeService = NodeService({
    tenant: sessionData.tenant,
    orgKey: sessionData.orgKey,
    userId: SYSTEM_USER,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  // Get contributors for this change request
  const contributors = await changeRequestService.findContributors(
    changeRequest.Id
  );
  const owners = await nodeService.findObjectOwners(approvalParentId);

  const recipients = [];

  // Add the original requester
  if (changeRequest.CreatedByUser && changeRequest.createdBy) {
    recipients.push({
      id: changeRequest.CreatedByUser,
      email: '', // Will be filled from user lookup if needed
      name: changeRequest.createdBy.UserName ?? '',
    });
  }

  // Add the action user (if different from creator)
  if (
    changeRequest.ActionUserId &&
    changeRequest.ActionUserId !== changeRequest.CreatedByUser
  ) {
    recipients.push({
      id: changeRequest.ActionUserId,
      email: '', // Will be filled from user lookup if needed
      name: '', // Will be filled from user lookup if needed
    });
  }

  // Add contributors
  contributors.forEach((contributor) => {
    if (contributor.UserId) {
      recipients.push({
        id: contributor.UserId,
        email: '', // Will be filled from user lookup if needed
        name: '', // Will be filled from user lookup if needed
      });
    }
  });

  // Add owners (those who might need to know about the rejection)
  owners
    .filter((owner) => !!owner.UserId)
    .forEach(({ UserId, user }) => {
      recipients.push({
        id: UserId,
        name: user?.UserName ?? '',
        email: user?.Email ?? '',
      });
    });

  // Remove duplicates based on user ID
  const uniqueRecipients = recipients.filter(
    (recipient, index, self) =>
      index === self.findIndex((r) => r.id === recipient.id)
  );

  return uniqueRecipients;
};
