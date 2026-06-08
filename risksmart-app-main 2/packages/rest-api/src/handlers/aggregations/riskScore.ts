import type {
  AssessmentResultParent,
  ControlParent,
  Risk,
  RiskAssessmentResult,
  TestResult,
} from 'generated/graphql';
import { ParentTypeEnum, RiskScoringModelEnum } from 'generated/graphql';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import { initI18n } from 'src/i18n';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { getNode } from 'src/services/node/nodeService';
import { getSessionData } from 'src/session';

import { getLogger } from '../../logger';
import { getTestResultByIdWithParents } from '../../services/test-result/testResultService';
import type { DataChangeEvent } from '../events/DataChangeEvent';
import { isTableName } from '../events/isTableName';
import { recalculate as recalculateEnterpriseRiskScores } from './enterpriseRiskScore';
import { handleControlUpdate } from './handlers/controlUpdateHandler';
import { recalculateScoresForRiskAssessmentParentEvent } from './handlers/recalculateScoresForAssessmentResultParentEvent';
import { recalculateScoresForRiskAssessmentResultEvent } from './handlers/recalculateScoresForRiskAssessmentResultEvent';
import { recalculateScoresForRiskEvent } from './handlers/recalculateScoresForRiskEvent';
import { models } from './models';
import type { ModelConfig } from './models/types';
import { getRatingCategories } from './ratingCategories';

const logger = getLogger();

export const handler = singleEventBridgeHandler<
  string,
  | DataChangeEvent<TestResult, 'test_result'>
  | DataChangeEvent<AssessmentResultParent, 'assessment_result_parent'>
  | DataChangeEvent<RiskAssessmentResult, 'risk_assessment_result'>
  | DataChangeEvent<ControlParent, 'control_parent'>
  | DataChangeEvent<Risk, 'risk'>,
  void
>(async (event) => {
  const sessionData = getSessionData(event.detail.event.session_variables);
  logger.appendKeys({
    ...sessionData,
  });
  const hasuraClient = getHasuraAdminClient(sessionData.tenant);
  const apiClient = getRisksmartApiClient(hasuraClient);

  const data = event.detail.event.data.new || event.detail.event.data.old;
  const OrgKey = data.OrgKey;
  await initI18n(OrgKey, hasuraClient);
  logger.appendKeys({
    table: event.detail.table.name,
    op: event.detail.event.op,
    orgKey: OrgKey,
  });
  const { aggregation_org } = await apiClient.getAggregationSettingsForOrg({
    OrgKey,
  });
  const aggregationSettings = aggregation_org[0];

  const riskScoringModel: RiskScoringModelEnum =
    aggregationSettings?.RiskScoringModel ?? RiskScoringModelEnum.Default;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = models[riskScoringModel] as ModelConfig<any>;
  const config = aggregationSettings?.Config;

  const ratingCategories = await getRatingCategories(
    apiClient,
    OrgKey,
    sessionData.tenant
  );

  if (isTableName(event.detail, 'risk_assessment_result')) {
    if (event.detail.event.op !== 'UPDATE') {
      logger.info('risk_assessment_result event is not an update. Skipping');

      return;
    }
    logger.info('Aggregating risk scores after risk assessment result change');
    const data = event.detail.event.data.new ?? event.detail.event.data.old;

    await recalculateScoresForRiskAssessmentResultEvent(
      hasuraClient,
      data,
      model,
      config,
      OrgKey,
      ratingCategories
    );
  }

  if (isTableName(event.detail, 'assessment_result_parent')) {
    logger.info(
      'Aggregating risk scores after assessment result parent change'
    );
    const data = event.detail.event.data.new ?? event.detail.event.data.old;

    await recalculateScoresForRiskAssessmentParentEvent(
      hasuraClient,
      data,
      model,
      config,
      OrgKey,
      ratingCategories
    );
  }

  if (isTableName(event.detail, 'test_result')) {
    if (!model.requiresAggregation) {
      logger.info('Aggregation not required. Skipping');

      return;
    }
    logger.info('Aggregating risk scores after test result update');

    if (
      event.detail.event.op === 'UPDATE' ||
      event.detail.event.op === 'INSERT'
    ) {
      // Skip if aggregation not enabled
      const testResultEvent = event.detail.event.data.new;
      const testResults = await getTestResultByIdWithParents(hasuraClient, {
        Id: testResultEvent.Id,
      });
      if (
        // If the test result has parents
        // All the parents should be either control or control & assessment result, otherwise rating from elsewhere.
        testResults?.[0]?.assessmentParents &&
        !testResults?.[0]?.assessmentParents?.every(
          (c) =>
            ['control', 'assessment'].includes(c.ParentType) ||
            ['control'].includes(c.ParentType)
        )
      ) {
        logger.info(
          'Result is not from an assessment or directly on a control. Skipping recalculation.'
        );

        return;
      }

      await handleControlUpdate(
        hasuraClient,
        testResultEvent.ParentControlId,
        event.detail.event.op,
        model,
        config,
        OrgKey,
        ratingCategories
      );
    } else {
      await handleControlUpdate(
        hasuraClient,
        event.detail.event.data.old.ParentControlId,
        event.detail.event.op,
        model,
        config,
        OrgKey,
        ratingCategories
      );
    }
  }

  if (isTableName(event.detail, 'risk')) {
    if (!model.requiresAggregation) {
      logger.info('Aggregation not required. Skipping');

      return;
    }

    logger.info('Aggregating risk scores after risk update');
    await recalculateScoresForRiskEvent(
      hasuraClient,
      {
        newRisk: event.detail.event.data.new,
        oldRisk: event.detail.event.data.old,
        op: event.detail.event.op,
      },
      model,
      config,
      OrgKey,
      ratingCategories
    );
  }

  if (isTableName(event.detail, 'control_parent')) {
    if (!model.requiresAggregation) {
      logger.info('Aggregation not required. Skipping');

      return;
    }
    logger.info(
      'Aggregating risk scores after (un)linking a control to a new parent'
    );

    if (
      event.detail.event.op === 'UPDATE' ||
      event.detail.event.op === 'INSERT'
    ) {
      await handleControlUpdate(
        hasuraClient,
        event.detail.event.data.new.ControlId,
        event.detail.event.op,
        model,
        config,
        OrgKey,
        ratingCategories
      );
    }

    if (event.detail.event.op === 'DELETE') {
      const node = await getNode(
        hasuraClient,
        event.detail.event.data.old.ParentId
      );

      // When we are deleting a control, we have to look up things by the Risk
      // as the relationship has already been removed
      if (node?.ObjectType !== ParentTypeEnum.Risk) {
        return;
      }

      await handleControlUpdate(
        hasuraClient,
        event.detail.event.data.old.ParentId,
        event.detail.event.op,
        model,
        config,
        OrgKey,
        ratingCategories
      );
    }
  }

  // Recalculate enterprise risk scores after any of the above events
  await recalculateEnterpriseRiskScores(OrgKey, sessionData.tenant);
});
