import type { AssessmentResultParent } from 'generated/graphql';
import { ParentTypeEnum } from 'generated/graphql';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import { getSessionData } from 'src/session';

import { getLogger } from '../../../logger';
import type { DataChangeEvent } from '../../events/DataChangeEvent';

const logger = getLogger();

export const handler = singleEventBridgeHandler<
  string,
  DataChangeEvent<AssessmentResultParent, 'assessment_result_parent'>,
  void
>(async (event) => {
  const {
    ResultType: resultType,
    ParentType: parentType,
    ParentId: parentId,
  } = event.detail.event.data.new ?? event.detail.event.data.old;
  const sessionData = getSessionData(event.detail.event.session_variables);
  const {
    ctx,
    refreshRiskRatingScheduleState,
    refreshDocumentScheduleState,
    refreshObligationScheduleState,
  } = createScheduleRefresh(sessionData);
  logger.appendKeys({
    ...sessionData,
  });
  logger.appendKeys({ parentId, parentType, op: event.detail.event.op });

  if (
    parentId == undefined ||
    resultType == undefined ||
    parentType == undefined
  ) {
    logger.info(`Not processing due to missing required data in event`);

    return;
  }
  if (
    parentType !== ParentTypeEnum.Document &&
    parentType !== ParentTypeEnum.Risk &&
    parentType !== ParentTypeEnum.Obligation
  ) {
    logger.info(`Not processing parent type`);

    return;
  }

  switch (resultType) {
    case ParentTypeEnum.DocumentAssessmentResult: {
      logger.info('Processing document assessment result update');
      await refreshDocumentScheduleState(ctx, parentId);

      return;
    }
    case ParentTypeEnum.ObligationAssessmentResult: {
      logger.info('Processing obligation assessment result update');
      await refreshObligationScheduleState(ctx, parentId);

      return;
    }
    case ParentTypeEnum.RiskAssessmentResult: {
      logger.info('Processing risk assessment result update');
      await refreshRiskRatingScheduleState(ctx, parentId);

      return;
    }
  }
});
