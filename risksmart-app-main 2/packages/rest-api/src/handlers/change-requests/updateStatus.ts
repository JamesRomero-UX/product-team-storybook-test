import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import { getLogger } from 'src/logger';
import { getSessionData } from 'src/session';

import type { ApproverResponse } from '../../../generated/graphql';
import { ApprovalStatusEnum } from '../../../generated/graphql';
import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from '../../repositories/types';
import { ChangeRequestService } from '../../services/change-request/change-request.service';
import { checkStatus } from '../../services/change-request/checkStatus';
import type { DataChangeEvent } from '../events/DataChangeEvent';
const logger = getLogger();

export const handler = singleEventBridgeHandler<
  string,
  DataChangeEvent<ApproverResponse, 'approver_response'>,
  void
>(async (e) => {
  const sessionData = getSessionData(e.detail.event?.session_variables);
  logger.appendKeys({
    ...sessionData,
  });
  const childLogger = logger.createChild({
    persistentKeys: {
      tenant: sessionData.tenant,
      changeRequestId: e.detail.event.data.new?.ChangeRequestId,
      approverResponseId: e.detail.event.data.new?.Id,
    },
  });
  childLogger.info(
    'Approval response updated. Processing change request status.'
  );

  if (!sessionData.tenant) {
    childLogger.info('Failed to get tenant.');

    return;
  }

  const changeRequestId = e.detail.event.data.new?.ChangeRequestId ?? '';
  if (!changeRequestId) {
    childLogger.warn('Change request id not found.');

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

  const { status } = checkStatus(changeRequest);
  childLogger.info('Change request status.', {
    status,
  });

  if (
    changeRequest.ChangeRequestStatus === ApprovalStatusEnum.Pending &&
    status === ApprovalStatusEnum.Approved
  ) {
    childLogger.info('Processing CR merge');
    try {
      await changeRequestService.merge(changeRequest);
    } catch (e) {
      await changeRequestService.updateStatus(
        changeRequest,
        ApprovalStatusEnum.Failed
      );
      throw new Error(
        `Failed to merge change request ${changeRequest.Id}: ${String(e)}`
      );
    }
  }
  childLogger.info('Updating status');
  await changeRequestService.updateStatus(changeRequest, status);
  childLogger.info('Updated status. Processing complete.');
});
