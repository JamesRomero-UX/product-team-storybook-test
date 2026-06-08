import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getObligationImpactsByParentIdQueryConfig } from '@risksmart-app/drizzle/src/queries/obligation-impact.query';
import type { CreateObligationImpactRequest } from '@risksmart-app/events/src/types/request-types';
import { filter } from '@risksmart-app/permitio/src/permit';

import { executeAsyncRequest } from '../../clients/async-request';
import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import type { ObligationImpactService, ServiceContext } from '../service.types';

export class ObligationImpactServiceImpl implements ObligationImpactService {
  async getObligationImpactsByParentId(ctx: ServiceContext, parentId: string) {
    const db = await createDrizzleClient(ctx);

    const obligationImpacts = await db.org((tx) => {
      return tx.query.obligation_impact.findMany({
        where: {
          ParentObligationId: parentId,
        },
        ...getObligationImpactsByParentIdQueryConfig,
      });
    });

    const filteredObligationImpacts = await filter<
      (typeof obligationImpacts)[0]
    >(
      obligationImpacts,
      'rs_node',
      (entity: (typeof obligationImpacts)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filteredObligationImpacts;
  }

  async insertObligationImpact(
    ctx: ServiceContext,
    input: CreateObligationImpactRequest
  ) {
    return executeAsyncRequest(ctx, input, {
      requestType: 'CREATE_OBLIGATION_IMPACT',
      buildRequestBody: (input) => ({
        ParentObligationId: input.ParentObligationId,
        Description: input.Description,
        ImpactRating: input.ImpactRating,
        CustomAttributeData: input.CustomAttributeData ?? null,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.createObligationImpact(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to create obligation impacts',
        404: 'Parent obligation not found',
      },
    });
  }

  async deleteObligationImpacts(ctx: ServiceContext, ids: string[]) {
    return executeAsyncRequest(
      ctx,
      { ids },
      {
        requestType: 'DELETE_OBLIGATION_IMPACTS',
        buildRequestBody: (input) => ({
          Ids: input.ids,
        }),
        successStatus: 204,
        apiCall: (ctx, input, correlationId) =>
          dataLayerApiClient.deleteObligationImpacts(
            toApiContext(ctx),
            input.ids,
            correlationId
          ),
        errorMessages: {
          403: 'You do not have permission to delete obligation impacts',
          404: 'Obligation impact not found',
        },
      }
    );
  }
}
