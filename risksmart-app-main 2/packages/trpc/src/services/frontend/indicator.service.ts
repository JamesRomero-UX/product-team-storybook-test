import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getIndicatorByIdQueryConfig,
  getIndicatorRegisterQueryConfig,
  getIndicatorResultsByIndicatorIdQueryConfig,
  getIndicatorsByParentIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/indicator.query';
import type {
  CreateIndicatorResultRequest,
  UpdateIndicatorRequest,
  UpdateIndicatorResultRequest,
} from '@risksmart-app/events/src/types/request-types';
import { filter } from '@risksmart-app/permitio/src/permit';
import { createRefreshIndicatorScheduleState } from '@risksmart-app/schedule-state/src/refresh-indicator-schedule-state';

import { createDataLayerScheduleDataAccess } from '../../adapters/schedule-data-access-adapter';
import { executeAsyncRequest } from '../../clients/async-request';
import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import type {
  GetIndicatorByIdResponseRow,
  GetIndicatorResultsByIndicatorIdResponseRow,
  GetIndicatorsByParentIdResponseRow,
} from '../../types/index';
import { logger } from '../../utils/logger';
import type { IndicatorService, ServiceContext } from '../service.types';

export class IndicatorServiceImpl implements IndicatorService {
  async getIndicatorsRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.indicator.findMany({
        ...getIndicatorRegisterQueryConfig,
      });
    });

    const filteredIndicators = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity: (typeof data)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    // Map results to orderedResults for interface compatibility
    const mappedIndicators = filteredIndicators.map((indicator) => ({
      ...indicator,
      orderedResults: indicator.results || [],
    }));

    return {
      indicators: mappedIndicators,
    };
  }

  async getIndicatorById(ctx: ServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.indicator.findMany({
        where: {
          Id: id,
        },
        ...getIndicatorByIdQueryConfig,
      });
    });

    return await filter<GetIndicatorByIdResponseRow>(
      data,
      'rs_node',
      (entity: GetIndicatorByIdResponseRow) => entity.Id,
      ctx.userId,
      ctx.orgId
    );
  }

  async getIndicatorResultsByIndicatorId(
    ctx: ServiceContext,
    indicatorId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.indicator_result.findMany({
        where: {
          IndicatorId: indicatorId,
        },
        orderBy: (t, { asc }) => [asc(t.ResultDate)],
        ...getIndicatorResultsByIndicatorIdQueryConfig,
      });
    });

    return await filter<GetIndicatorResultsByIndicatorIdResponseRow>(
      data,
      'rs_node',
      (entity: GetIndicatorResultsByIndicatorIdResponseRow) => entity.Id,
      ctx.userId,
      ctx.orgId
    );
  }

  async getIndicatorsByParentId(ctx: ServiceContext, parentId: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.indicator.findMany({
        where: {
          parents: { ParentId: parentId },
        },
        ...getIndicatorsByParentIdQueryConfig,
      });
    });

    const filteredIndicators = await filter<GetIndicatorsByParentIdResponseRow>(
      data,
      'rs_node',
      (entity: GetIndicatorsByParentIdResponseRow) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    const mappedIndicators = filteredIndicators.map((indicator) => ({
      ...indicator,
      orderedResults: indicator.results || [],
    }));

    return { indicator: mappedIndicators };
  }

  async insertIndicatorResult(
    ctx: ServiceContext,
    input: CreateIndicatorResultRequest
  ) {
    return executeAsyncRequest(ctx, input, {
      requestType: 'CREATE_INDICATOR_RESULT',
      buildRequestBody: (input) => ({
        Description: input.Description,
        IndicatorId: input.IndicatorId,
        ResultDate: input.ResultDate,
        TargetValueNum: input.TargetValueNum,
        TargetValueTxt: input.TargetValueTxt,
        CustomAttributeData: input.CustomAttributeData ?? null,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.createIndicatorResult(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to create indicator results',
      },
    });
  }

  async updateIndicatorResult(
    ctx: ServiceContext,
    input: UpdateIndicatorResultRequest
  ) {
    return executeAsyncRequest(ctx, input, {
      requestType: 'UPDATE_INDICATOR_RESULT',
      successStatus: 200,
      buildRequestBody: (input) => ({
        Id: input.Id,
        Description: input.Description ?? null,
        ResultDate: input.ResultDate,
        TargetValueNum: input.TargetValueNum ?? null,
        TargetValueTxt: input.TargetValueTxt ?? null,
        CustomAttributeData: input.CustomAttributeData ?? null,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.updateIndicatorResult(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to update this indicator result',
        404: 'Indicator result not found',
      },
    });
  }

  async deleteIndicators(ctx: ServiceContext, ids: string[]): Promise<void> {
    return executeAsyncRequest(
      ctx,
      { ids },
      {
        requestType: 'DELETE_INDICATORS',
        successStatus: 204,
        buildRequestBody: (input) => ({
          Ids: input.ids,
        }),
        apiCall: (ctx, input, correlationId) =>
          dataLayerApiClient.deleteIndicators(
            toApiContext(ctx),
            input.ids,
            correlationId
          ),
        errorMessages: {
          403: 'You do not have permission to delete indicators',
          404: 'Indicators not found',
        },
      }
    );
  }

  async deleteIndicatorResults(
    ctx: ServiceContext,
    ids: string[]
  ): Promise<void> {
    return executeAsyncRequest(
      ctx,
      { ids },
      {
        requestType: 'DELETE_INDICATOR_RESULTS',
        successStatus: 204,
        buildRequestBody: (input) => ({
          Ids: input.ids,
        }),
        apiCall: (ctx, input, correlationId) =>
          dataLayerApiClient.deleteIndicatorResults(
            toApiContext(ctx),
            input.ids,
            correlationId
          ),
        errorMessages: {
          403: 'You do not have permission to delete indicator results',
          404: 'Indicator results not found',
        },
      }
    );
  }

  async updateIndicator(ctx: ServiceContext, input: UpdateIndicatorRequest) {
    const result = await executeAsyncRequest(ctx, input, {
      requestType: 'UPDATE_INDICATOR',
      successStatus: 200,
      buildRequestBody: (input) => ({
        Id: input.Id,
        Title: input.Title,
        Type: input.Type,
        Description: input.Description ?? null,
        Unit: input.Unit ?? null,
        UpperToleranceNum: input.UpperToleranceNum ?? null,
        LowerToleranceNum: input.LowerToleranceNum ?? null,
        TargetValueTxt: input.TargetValueTxt ?? null,
        UpperAppetiteNum: input.UpperAppetiteNum ?? null,
        LowerAppetiteNum: input.LowerAppetiteNum ?? null,
        CustomAttributeData: input.CustomAttributeData ?? null,
        OwnerUserIds: input.OwnerUserIds ?? [],
        OwnerGroupIds: input.OwnerGroupIds ?? [],
        ContributorUserIds: input.ContributorUserIds ?? [],
        ContributorGroupIds: input.ContributorGroupIds ?? [],
        TagTypeIds: input.TagTypeIds ?? [],
        DepartmentTypeIds: input.DepartmentTypeIds ?? [],
        Schedule: input.Schedule ?? null,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.updateIndicator(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to update this indicator',
        404: 'Indicator not found',
      },
    });

    // Schedule state refresh after successful update
    const refreshIndicatorScheduleState = createRefreshIndicatorScheduleState(
      createDataLayerScheduleDataAccess()
    );
    try {
      await refreshIndicatorScheduleState(toApiContext(ctx), input.Id);
    } catch (error) {
      logger.warn(
        { indicatorId: input.Id, error },
        'Failed to refresh schedule state after indicator update'
      );
    }

    return result;
  }
}
