import { ParentTypeEnum } from 'generated/graphql';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { isOrgModuleEnabled } from 'src/services/orgUtilities';
import { getSessionData } from 'src/session';

import { RefreshScheduleStateSchema } from './schema';

/**
 * Handler to refresh the schedule state
 * This is used when a nodes schedule state needs to be recalculated,
 * for example, if there was a bug in the initial calculation.
 */
export const handler = backendRouteHandler(
  RefreshScheduleStateSchema,
  async (body) => {
    const sessionData = getSessionData(body.session_variables);
    const apiClient = getBackendRestApiClient(sessionData);
    const schedule = createScheduleRefresh(sessionData);
    const useImpacts = await isOrgModuleEnabled(
      { orgKey: sessionData.orgKey, tenant: sessionData.tenant },
      'risk.subModules.impact'
    );
    const missingNodeIds = [];
    const unsupportedNodeIds = [];
    const { node: nodes } = await apiClient.getNodes({
      where: { Id: { _in: body.input.Ids } },
    });
    for (const id of body.input.Ids) {
      const node = nodes.find((n) => n.Id === id);
      if (!node) {
        missingNodeIds.push(id);
        continue;
      }

      switch (node.ObjectType) {
        case ParentTypeEnum.Document:
          await schedule.refreshDocumentScheduleState(schedule.ctx, id);
          continue;
        case ParentTypeEnum.Control:
          await schedule.refreshControlScheduleState(schedule.ctx, id);
          continue;
        case ParentTypeEnum.Risk:
          await schedule.refreshRiskScheduleState(schedule.ctx, id, {
            useImpacts,
          });
          continue;
        case ParentTypeEnum.Indicator:
          await schedule.refreshIndicatorScheduleState(schedule.ctx, id);
          continue;
        case ParentTypeEnum.Obligation:
          await schedule.refreshObligationScheduleState(schedule.ctx, id);
          continue;
        default:
          unsupportedNodeIds.push(id);
          continue;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        missingNodeIds,
        unsupportedNodeIds,
      }),
    };
  }
);
