import type { AppetiteParent, Risk } from 'generated/graphql';
import { AppetiteModelEnum } from 'generated/graphql';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { getSessionData } from 'src/session';

import { getLogger } from '../../logger';
import type { DataChangeEvent } from '../events/DataChangeEvent';
import { isTableName } from '../events/isTableName';
import {
  cascade,
  inheritAppetite,
  unlinkChildRiskAppetites,
} from './models/appetiteCascading';

const logger = getLogger();

export const handler = singleEventBridgeHandler<
  string,
  | DataChangeEvent<AppetiteParent, 'appetite_parent'>
  | DataChangeEvent<Risk, 'risk'>,
  void
>(async (event) => {
  const data = event.detail.event.data.new || event.detail.event.data.old;
  const OrgKey = data.OrgKey;
  const sessionData = getSessionData(event.detail.event.session_variables);
  logger.appendKeys({
    ...sessionData,
  });

  const hasuraClient = getHasuraAdminClient(sessionData.tenant);
  const apiClient = getRisksmartApiClient(hasuraClient);
  const { aggregation_org } = await apiClient.getAggregationSettingsForOrg({
    OrgKey,
  });
  const aggregationSettings = aggregation_org[0];
  if (!aggregationSettings) {
    logger.info('Aggregation not supported for this org');

    return;
  }

  if (aggregationSettings.Appetite !== AppetiteModelEnum.TopDownCascade) {
    return;
  }

  if (isTableName(event.detail, 'risk')) {
    if (event.detail.event.op === 'INSERT') {
      logger.info('Aggregating appetites after risk insert');

      await inheritAppetite(hasuraClient, event.detail.event.data.new);
    }

    if (event.detail.event.op === 'UPDATE') {
      logger.info('Aggregating appetites after risk update');

      await inheritAppetite(hasuraClient, event.detail.event.data.new);
    }
  }

  if (isTableName(event.detail, 'appetite_parent')) {
    if (event.detail.event.op === 'INSERT') {
      logger.info('Aggregating appetites after appetite parent insert');

      const appetiteParent = event.detail.event.data.new;

      await cascade(hasuraClient, appetiteParent, aggregationSettings.Config);
    }

    if (event.detail.event.op === 'DELETE') {
      logger.info('Aggregating appetites after appetite parent deletion');

      const appetiteParent = event.detail.event.data.old;

      await unlinkChildRiskAppetites(hasuraClient, appetiteParent);
    }
  }
});
