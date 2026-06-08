import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getConsequenceAuditByIdQueryConfig,
  getConsequencesByIdQueryConfig,
  getConsequencesRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/consequence.query';
import type {
  CreateConsequenceRequest,
  UpdateConsequenceRequest,
} from '@risksmart-app/events/src/types/request-types';
import { filter } from '@risksmart-app/permitio/src/permit';

import { executeAsyncRequest } from '../../clients/async-request';
import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import type {
  ConsequenceAuditByIdResponseRow,
  ConsequenceByIdResponseRow,
  ConsequenceRegisterResponseRow,
} from '../../types/index';
import type { ConsequenceService, ServiceContext } from '../service.types';

export class ConsequenceServiceImpl implements ConsequenceService {
  async getConsequenceById(ctx: ServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.consequence.findMany({
        where: {
          Id: id,
        },
        ...getConsequencesByIdQueryConfig,
      });
    });

    return await filter<ConsequenceByIdResponseRow>(
      data,
      'rs_node',
      (entity: ConsequenceByIdResponseRow) => entity.Id,
      ctx.userId,
      ctx.orgId
    );
  }

  async getConsequenceAuditById(ctx: ServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.consequence_audit.findMany({
        where: {
          Id: id,
        },
        orderBy: (t, { desc }) => [desc(t.ModifiedAtTimestamp)],
        ...getConsequenceAuditByIdQueryConfig,
      });
    });

    return await filter<ConsequenceAuditByIdResponseRow>(
      data,
      'rs_node',
      (entity: ConsequenceAuditByIdResponseRow) => entity.Id,
      ctx.userId,
      ctx.orgId
    );
  }

  async getConsequencesByParentIssueId(
    ctx: ServiceContext,
    parentIssueId: string
  ) {
    const db = await createDrizzleClient(ctx);
    const data = await db.org((tx) => {
      return tx.query.consequence.findMany({
        where: {
          ParentIssueId: parentIssueId,
        },
        ...getConsequencesByIdQueryConfig,
      });
    });

    return await filter<ConsequenceByIdResponseRow>(
      data,
      'rs_node',
      (entity: ConsequenceByIdResponseRow) => entity.Id,
      ctx.userId,
      ctx.orgId
    );
  }

  async getConsequencesRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.consequence.findMany({
        ...getConsequencesRegisterQueryConfig,
      });
    });

    const filteredConsequences = await filter<ConsequenceRegisterResponseRow>(
      data,
      'rs_node',
      (entity: ConsequenceRegisterResponseRow) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return {
      consequence: filteredConsequences,
    };
  }

  async insertConsequence(
    ctx: ServiceContext,
    input: CreateConsequenceRequest
  ) {
    return executeAsyncRequest(ctx, input, {
      requestType: 'CREATE_CONSEQUENCE',
      buildRequestBody: (input) => ({
        ParentIssueId: input.ParentIssueId,
        Title: input.Title,
        Description: input.Description,
        Criticality: input.Criticality ?? null,
        CostType: input.CostType,
        CostValue: input.CostValue,
        Type: input.Type ?? null,
        CustomAttributeData: input.CustomAttributeData ?? null,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.createConsequence(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to create consequences',
        404: 'Parent issue not found',
      },
    });
  }

  async updateConsequence(
    ctx: ServiceContext,
    id: string,
    input: UpdateConsequenceRequest
  ) {
    return executeAsyncRequest(
      ctx,
      { ...input, Id: id },
      {
        requestType: 'UPDATE_CONSEQUENCE',
        successStatus: 200,
        buildRequestBody: (input) => ({
          Id: input.Id,
          ParentIssueId: input.ParentIssueId,
          Title: input.Title,
          Description: input.Description,
          Criticality: input.Criticality ?? null,
          CostType: input.CostType,
          CostValue: input.CostValue,
          Type: input.Type ?? null,
          CustomAttributeData: input.CustomAttributeData ?? null,
          OriginalTimestamp: input.OriginalTimestamp,
        }),
        apiCall: (ctx, input, correlationId) =>
          dataLayerApiClient.updateConsequence(
            toApiContext(ctx),
            id,
            input,
            correlationId
          ),
        errorMessages: {
          403: 'You do not have permission to update consequences',
          404: 'Consequence not found',
          409: 'Record was modified by another user',
        },
      }
    );
  }

  async deleteConsequences(ctx: ServiceContext, ids: string[]) {
    return executeAsyncRequest(
      ctx,
      { ids },
      {
        requestType: 'DELETE_CONSEQUENCES',
        buildRequestBody: (input) => ({
          Ids: input.ids,
        }),
        apiCall: (ctx, input, correlationId) =>
          dataLayerApiClient.deleteConsequences(
            toApiContext(ctx),
            input.ids,
            correlationId
          ),
        successStatus: 200,
        errorMessages: {
          403: 'You do not have permission to delete consequences',
          404: 'Consequences not found',
        },
      }
    );
  }
}
