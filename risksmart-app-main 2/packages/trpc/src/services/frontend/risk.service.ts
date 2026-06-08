import { RiskAssessmentResultControlType } from '@risksmart-app/domain/src/types/consts/index';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getRiskByIdQueryConfig,
  getRiskListOnlyOptimizedQueryConfig,
  getRiskListOnlyWithEntitiesOptimizedQueryConfig,
  getRiskRegisterQueryConfig,
  getRiskScoreQueryConfig,
  getRiskScoresByRiskIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/risk.query';
import type {
  CreateRiskRequest,
  UpdateRiskRequest,
} from '@risksmart-app/events/src/types/request-types';
import { filter } from '@risksmart-app/permitio/src/permit';
import { createRefreshRiskScheduleState } from '@risksmart-app/schedule-state/src/refresh-risk-schedule-state';
import { calculateInitialScheduleState } from '@risksmart-app/schedule-state/src/utils/schedule-utils';

import { createDataLayerScheduleDataAccess } from '../../adapters/schedule-data-access-adapter';
import { executeAsyncRequest } from '../../clients/async-request';
import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import type {
  RiskListOnlyOptimizedResponseRow,
  RiskListOnlyWithEntitiesOptimizedResponseRow,
  RiskScoresByRiskIdResponseRow,
} from '../../types/index';
import { RATING_TYPE_ASSESSMENT } from '../../utils/consts';
import { logger } from '../../utils/logger';
import type { RiskService, ServiceContext } from '../service.types';

export class RiskServiceImpl implements RiskService {
  async getRiskById(ctx: ServiceContext, riskId: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.risk.findMany({
        where: { Id: riskId },
        ...getRiskByIdQueryConfig,
      })
    );

    const filtered = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filtered;
  }
  async getRisksRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.risk.findMany(getRiskRegisterQueryConfig);
    });

    const filteredRisks = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity: (typeof data)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return {
      risk: filteredRisks,
    };
  }

  async getRiskScores(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    // Get all risks using the same query config as register
    const data = await db.org((tx) => {
      return tx.query.risk.findMany({
        ...getRiskScoreQueryConfig,
      });
    });

    const filteredRisks = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity: (typeof data)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    // Process each risk to extract latest inherent and residual assessments
    const risksWithLatestAssessments = filteredRisks.map((risk) => {
      const assessmentResults = risk.assessmentResults || [];

      // Sort assessments by TestDate (desc) then CreatedAtTimestamp (desc) to get latest first
      const sortedAssessments = assessmentResults
        .map((ar) => ar.riskAssessmentResult)
        .sort((a, b) => {
          const aTestDate = a?.TestDate;
          const bTestDate = b?.TestDate;
          const aCreatedAt = a?.CreatedAtTimestamp;
          const bCreatedAt = b?.CreatedAtTimestamp;

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

      // Find latest inherent and residual assessments
      const latestInherentAssessment = sortedAssessments.find(
        (assessment) =>
          assessment?.ControlType ===
          RiskAssessmentResultControlType.Uncontrolled
      );

      const latestResidualAssessment = sortedAssessments.find(
        (assessment) =>
          assessment?.ControlType === RiskAssessmentResultControlType.Controlled
      );

      return {
        ...risk,
        inherent: latestInherentAssessment
          ? [
              {
                ParentId: risk.Id,
                riskAssessmentResult: latestInherentAssessment,
              },
            ]
          : [],
        residual: latestResidualAssessment
          ? [
              {
                ParentId: risk.Id,
                riskAssessmentResult: latestResidualAssessment,
              },
            ]
          : [],
      };
    });

    return { risk: risksWithLatestAssessments };
  }

  async getRiskListOnlyOptimized(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.risk.findMany({
        ...getRiskListOnlyOptimizedQueryConfig,
      });
    });

    const filteredRisks = await filter<RiskListOnlyOptimizedResponseRow>(
      data,
      'rs_node',
      (entity) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filteredRisks;
  }

  async getRiskListOnlyWithEntitiesOptimized(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.risk.findMany({
        ...getRiskListOnlyWithEntitiesOptimizedQueryConfig,
      });
    });

    const filteredRisks =
      await filter<RiskListOnlyWithEntitiesOptimizedResponseRow>(
        data,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return filteredRisks;
  }

  async getRiskScoresByRiskId(ctx: ServiceContext, riskId: string) {
    const db = await createDrizzleClient(ctx);

    const risk = await db.org((tx) =>
      tx.query.risk.findMany({
        where: { Id: riskId },
        columns: {
          Id: true,
          Tier: true,
        },
      })
    );

    const inherent = await db.org((tx) =>
      tx.query.risk_assessment_result.findMany({
        where: {
          parents: { ParentId: riskId },
          ControlType: RiskAssessmentResultControlType.Uncontrolled,
          RatingType: { in: RATING_TYPE_ASSESSMENT },
        },
        orderBy: { TestDate: 'desc', CreatedAtTimestamp: 'desc' },
        limit: 1,
        ...getRiskScoresByRiskIdQueryConfig,
      })
    );

    const residual = await db.org((tx) =>
      tx.query.risk_assessment_result.findMany({
        where: {
          parents: { ParentId: riskId },
          ControlType: RiskAssessmentResultControlType.Controlled,
          RatingType: { in: RATING_TYPE_ASSESSMENT },
        },
        orderBy: { TestDate: 'desc', CreatedAtTimestamp: 'desc' },
        limit: 1,
        ...getRiskScoresByRiskIdQueryConfig,
      })
    );

    const [filteredRisk, filteredInherent, filteredResidual] =
      await Promise.all([
        filter<(typeof risk)[0]>(
          risk,
          'rs_node',
          (entity) => entity.Id,
          ctx.userId,
          ctx.orgId
        ),
        filter<RiskScoresByRiskIdResponseRow>(
          inherent,
          'rs_node',
          (entity) => entity.Id,
          ctx.userId,
          ctx.orgId
        ),
        filter<RiskScoresByRiskIdResponseRow>(
          residual,
          'rs_node',
          (entity) => entity.Id,
          ctx.userId,
          ctx.orgId
        ),
      ]);

    return {
      risk: filteredRisk,
      inherent: filteredInherent,
      residual: filteredResidual,
    };
  }

  async insertRisk(ctx: ServiceContext, input: CreateRiskRequest) {
    const inputWithScheduleState: CreateRiskRequest = {
      ...input,
      ScheduleState: input.Schedule
        ? calculateInitialScheduleState(input.Schedule)
        : null,
    };

    return executeAsyncRequest(ctx, inputWithScheduleState, {
      requestType: 'CREATE_RISK',
      buildRequestBody: (input) => ({
        ParentRiskId: input.ParentRiskId ?? null,
        Title: input.Title,
        Tier: input.Tier,
        Description: input.Description ?? null,
        Treatment: input.Treatment ?? null,
        Status: input.Status ?? null,
        CustomAttributeData: input.CustomAttributeData ?? null,
        OwnerUserIds: input.OwnerUserIds ?? [],
        OwnerGroupIds: input.OwnerGroupIds ?? [],
        ContributorUserIds: input.ContributorUserIds ?? [],
        ContributorGroupIds: input.ContributorGroupIds ?? [],
        TagTypeIds: input.TagTypeIds ?? [],
        DepartmentTypeIds: input.DepartmentTypeIds ?? [],
        Schedule: input.Schedule ?? null,
        ScheduleState: input.ScheduleState ?? null,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.createRisk(toApiContext(ctx), input, correlationId),
      errorMessages: {
        403: 'You do not have permission to create risks',
        404: 'Parent risk not found',
      },
    });
  }

  async updateRisk(
    ctx: ServiceContext,
    input: UpdateRiskRequest,
    options: { useImpacts: boolean }
  ) {
    const result = await executeAsyncRequest(ctx, input, {
      requestType: 'UPDATE_RISK',
      successStatus: 200,
      buildRequestBody: (input) => ({
        Id: input.Id,
        ParentRiskId: input.ParentRiskId ?? null,
        Title: input.Title,
        Tier: input.Tier,
        Description: input.Description ?? null,
        Treatment: input.Treatment ?? null,
        Status: input.Status ?? null,
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
        dataLayerApiClient.updateRisk(toApiContext(ctx), input, correlationId),
      errorMessages: {
        403: 'You do not have permission to update this risk',
        404: 'Risk not found',
      },
    });

    // Refresh schedule state after risk update
    const refreshRiskScheduleState = createRefreshRiskScheduleState(
      createDataLayerScheduleDataAccess()
    );
    try {
      await refreshRiskScheduleState(toApiContext(ctx), input.Id, {
        useImpacts: options.useImpacts,
      });
    } catch (error) {
      logger.warn(
        { riskId: input.Id, error },
        'Failed to refresh schedule state after risk update'
      );
    }

    return result;
  }

  async deleteRisk(ctx: ServiceContext, id: string): Promise<void> {
    await executeAsyncRequest<{ id: string }, void>(
      ctx,
      { id },
      {
        requestType: 'DELETE_RISK',
        buildRequestBody: (input) => ({
          Id: input.id,
        }),
        apiCall: (ctx, _input, correlationId) =>
          dataLayerApiClient.deleteRisk(toApiContext(ctx), id, correlationId),
        successStatus: 204,
        errorMessages: {
          403: 'You do not have permission to delete this risk',
          404: 'Risk not found',
        },
      }
    );
  }
}
