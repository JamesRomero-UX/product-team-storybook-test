import { hasLengthAtLeast, notEmpty } from '@risksmart-app/shared/typeGuards';
import type {
  DocumentAssessmentResult,
  ObligationAssessmentResult,
  RiskAssessmentResult,
} from 'generated/graphql';
import { ParentTypeEnum } from 'generated/graphql';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import { getSessionData } from 'src/session';

import { getHasuraBackendClient } from '../../../backendGraphqlClient';
import { getLogger } from '../../../logger';
import { CUSTOMER_SUPPORT_ROLE } from '../../../repositories/types';
import {
  getDocumentAssessmentResult,
  getObligationAssessmentResult,
  getRiskAssessmentResult,
} from '../../../services/assessment-result/assessmentResultService';
import type { DataChangeEvent } from '../../events/DataChangeEvent';

const logger = getLogger();

export const handler = singleEventBridgeHandler<
  string,
  | DataChangeEvent<RiskAssessmentResult, 'risk_assessment_result'>
  | DataChangeEvent<DocumentAssessmentResult, 'document_assessment_result'>
  | DataChangeEvent<ObligationAssessmentResult, 'obligation_assessment_result'>,
  void
>(async (event) => {
  const { Id } = event.detail.event.data.new ?? event.detail.event.data.old;
  const table = event.detail.table.name;
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
  const hasuraClient = getHasuraBackendClient(
    sessionData.tenant,
    sessionData.orgKey,
    sessionData.userId,
    CUSTOMER_SUPPORT_ROLE
  );
  logger.appendKeys({
    ...sessionData,
  });
  logger.appendKeys({ Id, table, op: event.detail.event.op });
  if (Id == undefined || table == undefined) {
    logger.info(`Not processing due to missing required data in event`);

    return;
  }
  if (
    ![
      'risk_assessment_result',
      'document_assessment_result',
      'obligation_assessment_result',
    ].includes(table)
  ) {
    logger.info(`Not processing parent type`);

    return;
  }

  switch (table) {
    case ParentTypeEnum.DocumentAssessmentResult: {
      logger.info('Processing document assessment result update');
      const documentAssessmentResult = await getDocumentAssessmentResult(
        hasuraClient,
        {
          Id,
        }
      );

      if (!hasLengthAtLeast(documentAssessmentResult, 1)) {
        logger.info('Document assessment result does not exist');

        return;
      }
      const documentIds = documentAssessmentResult[0]?.parents
        .filter((c) => c.document)
        .filter(notEmpty)
        .map((c) => c.document!.Id);

      if (!hasLengthAtLeast(documentIds, 1)) {
        logger.info('Document does not exist');

        return;
      }

      logger.info('Refreshing document schedule state');
      await refreshDocumentScheduleState(ctx, documentIds[0]);
      logger.info('Refreshed document schedule state');

      return;
    }
    case ParentTypeEnum.ObligationAssessmentResult: {
      logger.info('Processing obligation assessment result update');
      const obligationAssessmentResult = await getObligationAssessmentResult(
        hasuraClient,
        {
          Id,
        }
      );

      if (!hasLengthAtLeast(obligationAssessmentResult, 1)) {
        logger.info('Obligation assessment result does not exist');

        return;
      }
      const obligationIds = obligationAssessmentResult[0]?.parents
        .filter((c) => c.obligation)
        .filter(notEmpty)
        .map((c) => c.obligation!.Id);

      if (!hasLengthAtLeast(obligationIds, 1)) {
        logger.info('Obligation does not exist');

        return;
      }
      logger.info('Refreshing obligation schedule state');
      await refreshObligationScheduleState(ctx, obligationIds[0]);
      logger.info('Refreshed obligation schedule state');

      return;
    }
    case ParentTypeEnum.RiskAssessmentResult: {
      logger.info('Processing risk assessment result update');
      const riskAssessmentResult = await getRiskAssessmentResult(hasuraClient, {
        Id,
      });

      if (!hasLengthAtLeast(riskAssessmentResult, 1)) {
        logger.info('Risk assessment result does not exist');

        return;
      }
      const riskIds = riskAssessmentResult[0]?.parents
        .filter((c) => c.risk)
        .filter(notEmpty)
        .map((c) => c.risk!.Id);

      if (!hasLengthAtLeast(riskIds, 1)) {
        logger.info('Risk does not exist');

        return;
      }
      logger.info('Refreshing risk schedule state');
      await refreshRiskRatingScheduleState(ctx, riskIds[0]);
      logger.info('Refreshed risk schedule state');

      return;
    }
  }
  logger.info(`Complete processing assessment result parent`);
});
