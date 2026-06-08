import { hasLengthAtLeast } from '@risksmart-app/shared/typeGuards';
import { BadRequest, Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getLogger } from 'src/logger';
import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from 'src/repositories/types';
import { updateApproverResponse } from 'src/services/approver-response/approverResponseService';
import { ChangeRequestService } from 'src/services/change-request/change-request.service';
import { NodeService } from 'src/services/node/node.service';
import { getNode } from 'src/services/node/nodeService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import {
  AccessTypeEnum,
  ApprovalStatusEnum,
  ParentTypeEnum,
} from '../../../generated/graphql';
import { ApproverResponsePutSchema } from './schema';
const logger = getLogger();
export const handler = backendRouteHandler(
  ApproverResponsePutSchema,
  async (body) => {
    const sessionData = getSessionData(body.session_variables);
    const hasuraClient = getHasuraBackendClientForAction(body);
    const changeRequestService = ChangeRequestService({
      tenant: sessionData.tenant,
      orgKey: sessionData.orgKey,
      userId: sessionData.userId,
      userRole: CUSTOMER_SUPPORT_ROLE,
    });
    const input = body.input.input;

    const changeRequest = await changeRequestService.findById(
      input.ChangeRequestId
    );

    if (!changeRequest) {
      throw new BadRequest('Change request not found');
    }

    if (changeRequest.ChangeRequestStatus !== ApprovalStatusEnum.Pending) {
      throw new BadRequest('Only pending change requests can be responded too');
    }
    const nodeService = NodeService({
      tenant: sessionData.tenant,
      orgKey: sessionData.orgKey,
      userId: SYSTEM_USER,
      userRole: CUSTOMER_SUPPORT_ROLE,
    });

    const approverIds: string[] = [];
    if (input.OverrideLevel) {
      const parentObject = await getNode(hasuraClient, input.ChangeRequestId);
      const permissionGranted = await hasPermission(hasuraClient, {
        userId: sessionData.userId,
        parentObject,
        objectType: ParentTypeEnum.ChangeRequest,
        accessType: AccessTypeEnum.Delete,
      });

      if (!permissionGranted) {
        throw new Forbidden('Access denied');
      }
      const responseIdsToApprove = changeRequest.responses
        .filter((c) => !c.Approved && c.approver.level?.Id === input.LevelId)
        .map((c) => c.approver.Id);
      approverIds.push(...responseIdsToApprove);
      logger.info('Submitting approver override level responses', {
        approverIds,
        levelId: input.LevelId,
      });
    } else {
      const nodes = await nodeService.findManyByIds([changeRequest.ParentId]);
      if (!hasLengthAtLeast(nodes, 1)) {
        throw new BadRequest('Object ID(s) not found');
      }

      const isOwner = nodes[0].ancestorContributors.some(
        (c) => c.UserId === sessionData.userId
      );

      const responseIdsToApprove = changeRequest.responses
        .filter(
          (c) =>
            !c.Approved &&
            c.approver.level?.Id === input.LevelId &&
            ((isOwner && c.approver.OwnerApprover) ||
              c.approver.user?.Id === sessionData.userId ||
              c.approver.group?.users.some(
                (g) => g.authUsers.Id === sessionData.userId
              ))
        )
        .map((c) => c.approver.Id);
      approverIds.push(...responseIdsToApprove);
      logger.info('Submitting approver responses', {
        approverIds,
        isOwner,
      });
    }

    if (approverIds.length < 1) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          Id: input.ChangeRequestId,
        }),
      };
    }

    await updateApproverResponse(hasuraClient, {
      changeRequestId: changeRequest.Id,
      approverIds: approverIds,
      response: input.Response,
      comment: input.Comment,
      approvedByUser: sessionData.userId,
      approvedAtTimestamp: new Date(Date.now()).toISOString(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        Id: input.ChangeRequestId,
      }),
    };
  }
);
