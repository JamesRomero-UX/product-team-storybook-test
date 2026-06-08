import {
  AppetiteStatus,
  AppetiteType,
} from '@risksmart-app/domain/src/types/consts/index';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getActiveAppetitesByParentIdQueryConfig,
  getAppetiteByIdQueryConfig,
  getAppetiteParentRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/appetite.query';
import { getAppetitesGroupedByImpactQueryConfig } from '@risksmart-app/drizzle/src/queries/impact.query';
import type {
  CreateAppetiteRequest,
  UpdateAppetiteRequest,
} from '@risksmart-app/events/src/types/request-types';
import { filter } from '@risksmart-app/permitio/src/permit';

import { executeAsyncRequest } from '../../clients/async-request';
import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import type {
  CreateAppetiteResponse,
  GetActiveAppetitesByParentIdResponseRow,
  GetAppetitesGroupedByImpactResponseRow,
  UpdateAppetiteResponse,
} from '../../types/index';
import type { AppetiteService, ServiceContext } from '../service.types';

export class AppetiteServiceImpl implements AppetiteService {
  async getActiveAppetitesRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    // Get appetite_parent data to match getActiveRiskAppetites GraphQL query
    const appetiteParents = await db.org((tx) => {
      return tx.query.appetite_parent.findMany({
        where: {
          Status: AppetiteStatus.Active,
          appetite: {
            AppetiteType: AppetiteType.Risk,
          },
        },
        ...getAppetiteParentRegisterQueryConfig,
      });
    });

    const filteredAppetiteParents = await filter<(typeof appetiteParents)[0]>(
      appetiteParents,
      'rs_node',
      (entity: (typeof appetiteParents)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    for (const appetiteParent of filteredAppetiteParents) {
      appetiteParent.risk?.assessmentResults?.sort((a, b) => {
        const aTestDate = a.riskAssessmentResult?.TestDate;
        const bTestDate = b.riskAssessmentResult?.TestDate;
        const aCreatedAt = a.riskAssessmentResult?.CreatedAtTimestamp;
        const bCreatedAt = b.riskAssessmentResult?.CreatedAtTimestamp;

        // First sort by TestDate (descending - most recent first)
        if (aTestDate && bTestDate) {
          const testDateCompare =
            new Date(bTestDate).getTime() - new Date(aTestDate).getTime();
          if (testDateCompare !== 0) {
            return testDateCompare;
          }
        } else if (aTestDate && !bTestDate) {
          return -1; // a has TestDate, b doesn't - a comes first
        } else if (!aTestDate && bTestDate) {
          return 1; // b has TestDate, a doesn't - b comes first
        }

        // If TestDate is the same or both are null, sort by CreatedAtTimestamp (descending)
        if (aCreatedAt && bCreatedAt) {
          return (
            new Date(bCreatedAt).getTime() - new Date(aCreatedAt).getTime()
          );
        } else if (aCreatedAt && !bCreatedAt) {
          return -1;
        } else if (!aCreatedAt && bCreatedAt) {
          return 1;
        }

        return 0; // Both are equal
      });
    }

    return {
      appetite_parent: filteredAppetiteParents,
    };
  }

  async getAppetitesByParentId(ctx: ServiceContext, parentId: string) {
    const db = await createDrizzleClient(ctx);

    // Get appetite_parent data to match getActiveRiskAppetites GraphQL query
    const appetiteParents = await db.org((tx) => {
      return tx.query.appetite_parent.findMany({
        where: {
          ParentId: parentId,
        },
        ...getAppetiteParentRegisterQueryConfig,
      });
    });

    const filteredAppetiteParents = await filter<(typeof appetiteParents)[0]>(
      appetiteParents,
      'rs_node',
      (entity: (typeof appetiteParents)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return {
      appetite_parent: filteredAppetiteParents,
    };
  }

  async getAppetiteById(ctx: ServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    const appetites = await db.org((tx) => {
      return tx.query.appetite.findMany({
        where: {
          Id: id,
        },
        ...getAppetiteByIdQueryConfig,
      });
    });

    const filteredAppetites = await filter<(typeof appetites)[0]>(
      appetites,
      'rs_node',
      (entity: (typeof appetites)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filteredAppetites;
  }

  async getActiveAppetitesByParentId(ctx: ServiceContext, parentId: string) {
    const db = await createDrizzleClient(ctx);

    const appetites = await db.org((tx) => {
      return tx.query.appetite_parent.findMany({
        where: {
          ParentId: parentId,
          Status: AppetiteStatus.Active,
        },
        ...getActiveAppetitesByParentIdQueryConfig,
      });
    });

    const filteredAppetites =
      await filter<GetActiveAppetitesByParentIdResponseRow>(
        appetites,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return filteredAppetites;
  }

  async getAppetitesGroupedByImpact(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);
    const data = await db.org((tx) => {
      return tx.query.impact.findMany({
        ...getAppetitesGroupedByImpactQueryConfig,
      });
    });

    const filteredImpacts =
      await filter<GetAppetitesGroupedByImpactResponseRow>(
        data,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return filteredImpacts;
  }

  async insertAppetite(
    ctx: ServiceContext,
    input: CreateAppetiteRequest
  ): Promise<CreateAppetiteResponse> {
    // Apply AppetiteType-specific field nullification (domain logic)
    const processedInput: CreateAppetiteRequest = {
      ...input,
      LowerAppetite:
        input.AppetiteType === AppetiteType.Risk
          ? (input.LowerAppetite ?? null)
          : null,
      UpperAppetite:
        input.AppetiteType === AppetiteType.Risk
          ? (input.UpperAppetite ?? null)
          : null,
      ImpactAppetite:
        input.AppetiteType === AppetiteType.Impact
          ? (input.ImpactAppetite ?? null)
          : null,
      LikelihoodAppetite:
        input.AppetiteType === AppetiteType.Likelihood
          ? (input.LikelihoodAppetite ?? null)
          : null,
      ImpactId:
        input.AppetiteType === AppetiteType.Impact
          ? (input.ImpactId ?? null)
          : null,
    };

    return executeAsyncRequest(ctx, processedInput, {
      requestType: 'CREATE_APPETITE',
      buildRequestBody: (input) => ({
        ParentIds: input.ParentIds,
        AppetiteType: input.AppetiteType,
        Statement: input.Statement ?? null,
        EffectiveDate: input.EffectiveDate ?? null,
        LowerAppetite: input.LowerAppetite ?? null,
        UpperAppetite: input.UpperAppetite ?? null,
        ImpactAppetite: input.ImpactAppetite ?? null,
        LikelihoodAppetite: input.LikelihoodAppetite ?? null,
        ImpactId: input.ImpactId ?? null,
        CustomAttributeData: input.CustomAttributeData ?? null,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.createAppetite(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to create appetites',
        404: 'Parent not found',
      },
    });
  }

  async updateAppetite(
    ctx: ServiceContext,
    input: UpdateAppetiteRequest
  ): Promise<UpdateAppetiteResponse> {
    return executeAsyncRequest(ctx, input, {
      requestType: 'UPDATE_APPETITE',
      successStatus: 200,
      buildRequestBody: (input) => ({
        Id: input.Id,
        AppetiteType: input.AppetiteType,
        Statement: input.Statement ?? null,
        EffectiveDate: input.EffectiveDate ?? null,
        LowerAppetite: input.LowerAppetite ?? null,
        UpperAppetite: input.UpperAppetite ?? null,
        ImpactAppetite: input.ImpactAppetite ?? null,
        LikelihoodAppetite: input.LikelihoodAppetite ?? null,
        ImpactId: input.ImpactId ?? null,
        CustomAttributeData: input.CustomAttributeData ?? null,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.updateAppetite(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to update appetites',
        404: 'Appetite not found',
      },
    });
  }

  async deleteAppetites(ctx: ServiceContext, ids: string[]) {
    return executeAsyncRequest(
      ctx,
      { ids },
      {
        requestType: 'DELETE_APPETITES',
        buildRequestBody: (input) => ({
          Ids: input.ids,
        }),
        apiCall: (ctx, input, correlationId) =>
          dataLayerApiClient.deleteAppetites(
            toApiContext(ctx),
            input.ids,
            correlationId
          ),
        successStatus: 204,
        errorMessages: {
          403: 'You do not have permission to delete appetites',
          404: 'Appetites not found',
        },
      }
    );
  }
}
