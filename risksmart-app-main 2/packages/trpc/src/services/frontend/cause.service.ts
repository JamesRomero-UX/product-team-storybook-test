import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getCauseByIdQueryConfig,
  getCauseRegisterQueryConfig,
  getCausesByParentIssueIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/cause.query';
import type {
  CreateCauseRequest,
  UpdateCauseRequest,
} from '@risksmart-app/events/src/types/request-types';
import { filter } from '@risksmart-app/permitio/src/permit';

import { executeAsyncRequest } from '../../clients/async-request';
import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import type { CauseService, ServiceContext } from '../service.types';

export class CauseServiceImpl implements CauseService {
  async getCausesByParentIssueId(ctx: ServiceContext, parentIssueId: string) {
    const db = await createDrizzleClient(ctx);
    const data = await db.org((tx) => {
      return tx.query.cause.findMany({
        where: {
          ParentIssueId: parentIssueId,
        },
        ...getCausesByParentIssueIdQueryConfig,
      });
    });

    const filteredCauses = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity: (typeof data)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filteredCauses;
  }
  async getCausesRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.cause.findMany({
        ...getCauseRegisterQueryConfig,
      });
    });

    const filteredCauses = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity: (typeof data)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return {
      cause: filteredCauses,
    };
  }
  async getCauseById(ctx: ServiceContext, causeId: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.cause.findMany({
        where: {
          Id: causeId,
        },
        ...getCauseByIdQueryConfig,
      });
    });

    const filteredCauses = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity: (typeof data)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filteredCauses;
  }

  async insertCause(ctx: ServiceContext, input: CreateCauseRequest) {
    return executeAsyncRequest(ctx, input, {
      requestType: 'CREATE_CAUSE',
      buildRequestBody: (input) => ({
        ParentIssueId: input.ParentIssueId,
        Title: input.Title,
        Description: input.Description,
        Significance: input.Significance ?? null,
        CustomAttributeData: input.CustomAttributeData ?? null,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.createCause(toApiContext(ctx), input, correlationId),
      errorMessages: {
        403: 'You do not have permission to create causes',
        404: 'Parent issue not found',
      },
    });
  }

  async updateCause(
    ctx: ServiceContext,
    id: string,
    input: UpdateCauseRequest
  ) {
    return executeAsyncRequest(
      ctx,
      { ...input, Id: id },
      {
        requestType: 'UPDATE_CAUSE',
        successStatus: 200,
        buildRequestBody: (input) => ({
          Id: input.Id,
          ParentIssueId: input.ParentIssueId,
          Title: input.Title,
          Description: input.Description,
          Significance: input.Significance ?? null,
          CustomAttributeData: input.CustomAttributeData ?? null,
          OriginalTimestamp: input.OriginalTimestamp,
        }),
        apiCall: (ctx, input, correlationId) =>
          dataLayerApiClient.updateCause(
            toApiContext(ctx),
            id,
            input,
            correlationId
          ),
        errorMessages: {
          403: 'You do not have permission to update causes',
          404: 'Cause not found',
          409: 'Record was modified by another user',
        },
      }
    );
  }

  async deleteCauses(ctx: ServiceContext, ids: string[]) {
    return executeAsyncRequest(
      ctx,
      { ids },
      {
        requestType: 'DELETE_CAUSES',
        buildRequestBody: (input) => ({
          Ids: input.ids,
        }),
        apiCall: (ctx, input, correlationId) =>
          dataLayerApiClient.deleteCauses(
            toApiContext(ctx),
            input.ids,
            correlationId
          ),
        successStatus: 200,
        errorMessages: {
          403: 'You do not have permission to delete causes',
          404: 'Causes not found',
        },
      }
    );
  }
}
