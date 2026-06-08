import { AppetiteModelEnum } from 'generated/graphql';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { getChildRisks } from 'src/services/risk/riskService';
import { getSessionData } from 'src/session';
import { z } from 'zod';

import { getLogger } from '../../logger';
import { inheritAppetite } from './models/appetiteCascading';

const logger = getLogger();

export const RecalculateAllAppetitesSchema = z.object({});

/**
 * RecalculateAllAppetites is a utility function to force inheritance of
 * appetites across all risks in an org. This is only done when the org had
 * their data imported before the appetite cascade was implemented or they
 * decided to turn it on at a later date.
 */
export const handler = backendRouteHandler(
  RecalculateAllAppetitesSchema,
  async (body) => {
    const sessionData = getSessionData(body.session_variables);

    const hasuraClient = getHasuraAdminClient(sessionData.tenant);
    const apiClient = getRisksmartApiClient(hasuraClient);
    const { aggregation_org } = await apiClient.getAggregationSettingsForOrg({
      OrgKey: sessionData.orgKey,
    });
    const aggregationSettings = aggregation_org[0];
    if (!aggregationSettings) {
      logger.info('Aggregation not supported for this org');

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Aggregation not supported for this org',
        }),
      };
    }

    if (aggregationSettings.Appetite !== AppetiteModelEnum.TopDownCascade) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Unsupported appetite aggregation type ${aggregationSettings.Appetite}`,
        }),
      };
    }

    const { risk: tierOneRisks } = await apiClient.getRiskByTier({
      OrgKey: sessionData.orgKey,
      Tier: 1,
    });
    const tierOneRiskIds = tierOneRisks.map((risk) => risk.Id);
    await Promise.all(
      tierOneRiskIds.map(async (id) => {
        try {
          const childRisks = await getChildRisks(hasuraClient, id);
          const tierTwoRisks = childRisks.filter((risk) => risk.Tier === 2);
          const tierThreeRisks = childRisks.filter((risk) => risk.Tier === 3);
          // Must inherit appetite in ascending order of tiers
          await Promise.all(
            tierTwoRisks.map(async (risk) => {
              await inheritAppetite(hasuraClient, risk);
            })
          );
          await Promise.all(
            tierThreeRisks.map(async (risk) => {
              await inheritAppetite(hasuraClient, risk);
            })
          );
        } catch (e) {
          logger.error(`Error cascading appetite for risk ${id}`, { e });
        }
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Recalculated all appetites' }),
    };
  }
);
