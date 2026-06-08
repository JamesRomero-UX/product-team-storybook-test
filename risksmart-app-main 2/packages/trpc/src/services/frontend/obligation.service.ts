import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getAssessmentResultParentWithObligationResultsQueryConfig } from '@risksmart-app/drizzle/src/queries/assessment-result.query';
import {
  getObligationByIdQueryConfig,
  getObligationRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/obligation.query';
import type { CreateObligationRequest } from '@risksmart-app/events/src/types/request-types';
import { filter } from '@risksmart-app/permitio/src/permit';
import { calculateInitialScheduleState } from '@risksmart-app/schedule-state/src/utils/schedule-utils';

import { executeAsyncRequest } from '../../clients/async-request';
import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import { RATING_TYPE_ASSESSMENT } from '../../utils/consts';
import { sortByDateDesc } from '../../utils/sorting';
import type { ObligationService, ServiceContext } from '../service.types';

export class ObligationServiceImpl implements ObligationService {
  async getObligationsRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    // Query obligations with comprehensive relationships
    const data = await db.org((tx) => {
      return tx.query.obligation.findMany({
        ...getObligationRegisterQueryConfig,
      });
    });

    // Get assessment results for obligations
    const assessmentResults = await db.org((tx) => {
      return tx.query.assessment_result_parent.findMany({
        where: {
          obligationAssessmentResult: {
            RatingType: { in: RATING_TYPE_ASSESSMENT },
          },
        },
        ...getAssessmentResultParentWithObligationResultsQueryConfig,
      });
    });

    // Sort the assessment results by TestDate then CreatedAtTimestamp on the obligationAssessmentResult
    assessmentResults.sort((a, b) =>
      sortByDateDesc(
        a.obligationAssessmentResult,
        b.obligationAssessmentResult,
        'TestDate',
        'CreatedAtTimestamp'
      )
    );

    const filteredObligations = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity: (typeof data)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    const filteredAssessmentResults = await filter<
      (typeof assessmentResults)[0]
    >(
      assessmentResults,
      'rs_node',
      (entity: (typeof assessmentResults)[0]) => entity.ParentId,
      ctx.userId,
      ctx.orgId
    );

    return {
      obligation: filteredObligations,
      assessment_result_parent: filteredAssessmentResults,
    };
  }

  async getObligationById(ctx: ServiceContext, obligationId: string) {
    const db = await createDrizzleClient(ctx);

    const obligations = await db.org((tx) => {
      return tx.query.obligation.findMany({
        where: {
          Id: obligationId,
        },
        ...getObligationByIdQueryConfig,
      });
    });

    const filteredObligations = await filter<(typeof obligations)[0]>(
      obligations,
      'rs_node',
      (entity: (typeof obligations)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filteredObligations;
  }

  async insertObligation(ctx: ServiceContext, input: CreateObligationRequest) {
    const inputWithScheduleState: CreateObligationRequest = {
      ...input,
      ScheduleState: input.Schedule
        ? calculateInitialScheduleState(input.Schedule)
        : null,
    };

    return executeAsyncRequest(ctx, inputWithScheduleState, {
      requestType: 'CREATE_OBLIGATION',
      buildRequestBody: (input) => ({
        ParentId: input.ParentId ?? null,
        Title: input.Title,
        Adherence: input.Adherence,
        Type: input.Type,
        Description: input.Description ?? null,
        Interpretation: input.Interpretation ?? null,
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
        dataLayerApiClient.createObligation(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to create obligations',
        404: 'Parent obligation not found',
      },
    });
  }
}
