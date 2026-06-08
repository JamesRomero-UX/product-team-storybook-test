import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getAcceptanceByIdQueryConfig,
  getAcceptanceRegisterQueryConfig,
  getAcceptancesByParentRiskIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/acceptance.query';
import { change_request } from '@risksmart-app/drizzle/src/schema';
import type {
  CreateAcceptanceRequest,
  UpdateAcceptanceRequest,
} from '@risksmart-app/events/src/types/request-types';
import { filter } from '@risksmart-app/permitio/src/permit';
import { asc, desc, inArray } from 'drizzle-orm';

import { executeAsyncRequest } from '../../clients/async-request';
import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import type { AcceptancesService, ServiceContext } from '../service.types';

export class AcceptancesServiceImpl implements AcceptancesService {
  async getAcceptancesRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    const acceptances = await db.org((tx) => {
      return tx.query.acceptance.findMany({
        ...getAcceptanceRegisterQueryConfig,
      });
    });

    const filteredAcceptances = await filter<(typeof acceptances)[0]>(
      acceptances,
      'rs_node',
      (entity: (typeof acceptances)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    const changeRequests =
      filteredAcceptances.length > 0
        ? await db.org((tx) => {
            return tx
              .selectDistinctOn(
                [change_request.ParentId, change_request.ChangeRequestStatus],
                {
                  ChangeRequestStatus: change_request.ChangeRequestStatus,
                  ModifiedAtTimestamp: change_request.ModifiedAtTimestamp,
                  ParentId: change_request.ParentId,
                }
              )
              .from(change_request)
              .where(
                inArray(
                  change_request.ParentId,
                  filteredAcceptances.map((item) => item.Id)
                )
              )
              .orderBy(
                asc(change_request.ParentId),
                asc(change_request.ChangeRequestStatus),
                desc(change_request.ModifiedAtTimestamp)
              );
          })
        : [];

    // Create a Map for O(1) lookup of changeRequests by ParentId
    const changeRequestsByParentId = new Map<string, typeof changeRequests>();
    for (const cr of changeRequests) {
      if (!changeRequestsByParentId.has(cr.ParentId)) {
        changeRequestsByParentId.set(cr.ParentId, []);
      }
      changeRequestsByParentId.get(cr.ParentId)!.push(cr);
    }

    return {
      acceptance: filteredAcceptances.map((a) => ({
        ...a,
        changeRequests: (changeRequestsByParentId.get(a.Id) || []).map(
          (cr) => ({
            ChangeRequestStatus: cr.ChangeRequestStatus,
            ModifiedAtTimestamp: cr.ModifiedAtTimestamp,
          })
        ),
      })),
    };
  }

  async getAcceptanceById(ctx: ServiceContext, acceptanceId: string) {
    const db = await createDrizzleClient(ctx);

    const acceptances = await db.org((tx) => {
      return tx.query.acceptance.findMany({
        where: {
          Id: acceptanceId,
        },
        ...getAcceptanceByIdQueryConfig,
      });
    });

    const filteredAcceptances = await filter<(typeof acceptances)[0]>(
      acceptances,
      'rs_node',
      (entity: (typeof acceptances)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filteredAcceptances;
  }

  async getAcceptancesByParentRiskId(ctx: ServiceContext, riskId: string) {
    const db = await createDrizzleClient(ctx);

    const acceptances = await db.org((tx) => {
      return tx.query.acceptance.findMany({
        where: { parents: { ParentId: riskId } },
        ...getAcceptancesByParentRiskIdQueryConfig,
      });
    });

    const filteredAcceptances = await filter<(typeof acceptances)[0]>(
      acceptances,
      'rs_node',
      (entity: (typeof acceptances)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    const changeRequests =
      filteredAcceptances.length > 0
        ? await db.org((tx) => {
            return tx
              .selectDistinctOn(
                [change_request.ParentId, change_request.ChangeRequestStatus],
                {
                  ChangeRequestStatus: change_request.ChangeRequestStatus,
                  ModifiedAtTimestamp: change_request.ModifiedAtTimestamp,
                  ParentId: change_request.ParentId,
                }
              )
              .from(change_request)
              .where(
                inArray(
                  change_request.ParentId,
                  filteredAcceptances.map((item) => item.Id)
                )
              )
              .orderBy(
                asc(change_request.ParentId),
                asc(change_request.ChangeRequestStatus),
                desc(change_request.ModifiedAtTimestamp)
              );
          })
        : [];

    // Create a Map for O(1) lookup of changeRequests by ParentId
    const changeRequestsByParentId = new Map<string, typeof changeRequests>();
    for (const cr of changeRequests) {
      if (!changeRequestsByParentId.has(cr.ParentId)) {
        changeRequestsByParentId.set(cr.ParentId, []);
      }
      changeRequestsByParentId.get(cr.ParentId)!.push(cr);
    }

    return {
      acceptance: filteredAcceptances.map((a) => ({
        ...a,
        changeRequests: (changeRequestsByParentId.get(a.Id) || []).map(
          (cr) => ({
            ChangeRequestStatus: cr.ChangeRequestStatus,
            ModifiedAtTimestamp: cr.ModifiedAtTimestamp,
          })
        ),
      })),
    };
  }

  async insertAcceptance(ctx: ServiceContext, input: CreateAcceptanceRequest) {
    return executeAsyncRequest(ctx, input, {
      requestType: 'CREATE_ACCEPTANCE',
      buildRequestBody: (input) => ({
        ParentId: input.ParentId,
        DateAcceptedFrom: input.DateAcceptedFrom,
        DateAcceptedTo: input.DateAcceptedTo,
        Title: input.Title,
        Details: input.Details,
        Status: input.Status,
        ApprovedByUser: input.ApprovedByUser ?? null,
        ApprovedByUserGroup: input.ApprovedByUserGroup ?? null,
        RequestedByUser: input.RequestedByUser ?? null,
        RequestedByUserGroup: input.RequestedByUserGroup ?? null,
        CustomAttributeData: input.CustomAttributeData ?? null,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.createAcceptance(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to create acceptances',
        404: 'Parent risk not found',
      },
    });
  }

  async updateAcceptance(ctx: ServiceContext, input: UpdateAcceptanceRequest) {
    return executeAsyncRequest(ctx, input, {
      requestType: 'UPDATE_ACCEPTANCE',
      successStatus: 200,
      buildRequestBody: (input) => ({
        Id: input.Id,
        DateAcceptedFrom: input.DateAcceptedFrom,
        DateAcceptedTo: input.DateAcceptedTo,
        Title: input.Title,
        Details: input.Details,
        Status: input.Status,
        ApprovedByUser: input.ApprovedByUser ?? null,
        ApprovedByUserGroup: input.ApprovedByUserGroup ?? null,
        RequestedByUser: input.RequestedByUser ?? null,
        RequestedByUserGroup: input.RequestedByUserGroup ?? null,
        CustomAttributeData: input.CustomAttributeData ?? null,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.updateAcceptance(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to update acceptances',
        404: 'Acceptance not found',
      },
    });
  }

  async deleteAcceptances(ctx: ServiceContext, ids: string[]) {
    return executeAsyncRequest(
      ctx,
      { ids },
      {
        requestType: 'DELETE_ACCEPTANCES',
        buildRequestBody: (input) => ({
          Ids: input.ids,
        }),
        apiCall: (ctx, input, correlationId) =>
          dataLayerApiClient.deleteAcceptances(
            toApiContext(ctx),
            input.ids,
            correlationId
          ),
        successStatus: 204,
        errorMessages: {
          403: 'You do not have permission to delete acceptances',
          404: 'Acceptances not found',
        },
      }
    );
  }
}
