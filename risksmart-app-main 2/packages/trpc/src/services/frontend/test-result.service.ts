import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getComplianceMonitoringAssessmentTestResultsByControlIdQueryConfig,
  getInternalAuditReportTestResultsByControlIdQueryConfig,
  getTestResultByIdQueryConfig,
  getTestResultsByControlIdQueryConfig,
  getTestResultsQueryConfig,
} from '@risksmart-app/drizzle/src/queries/test-result.query';
import type {
  CreateControlTestResultRequest,
  UpdateTestResultRequest,
} from '@risksmart-app/events/src/types/request-types';
import { filter } from '@risksmart-app/permitio/src/permit';
import { createRefreshControlScheduleState } from '@risksmart-app/schedule-state/src/refresh-control-schedule-state';

import { createDataLayerScheduleDataAccess } from '../../adapters/schedule-data-access-adapter';
import { executeAsyncRequest } from '../../clients/async-request';
import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import type {
  ComplianceMonitoringAssessmentTestResultsByControlIdResponseRow,
  InternalAuditReportTestResultsByControlIdResponseRow,
  TestResultByIdResponseRow,
  TestResultsByControlIdResponseRow,
  TestResultsResponseRow,
} from '../../types/index';
import { RATING_TYPE_ASSESSMENT } from '../../utils/consts';
import { logger } from '../../utils/logger';
import type { ServiceContext, TestResultService } from '../service.types';

export class TestResultServiceImpl implements TestResultService {
  async getTestResults(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.test_result.findMany({
        where: {
          RatingType: { in: RATING_TYPE_ASSESSMENT },
        },
        ...getTestResultsQueryConfig,
      })
    );

    const filteredTestResults = await filter<TestResultsResponseRow>(
      data,
      'rs_node',
      (entity) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    const testResultsWithFileCounts = filteredTestResults.map((testResult) => ({
      ...testResult,
      files_aggregate: { aggregate: { count: testResult.files.length } },
    }));

    return {
      test_result: testResultsWithFileCounts,
    };
  }

  async getTestResultById(ctx: ServiceContext, testResultId: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.test_result.findMany({
        where: {
          Id: testResultId,
        },
        ...getTestResultByIdQueryConfig,
      })
    );

    return await filter<TestResultByIdResponseRow>(
      data,
      'rs_node',
      (entity) => entity.Id,
      ctx.userId,
      ctx.orgId
    );
  }

  async getLatestTestResultsByControlId(
    ctx: ServiceContext,
    controlId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.test_result.findMany({
        where: {
          ParentControlId: controlId,
          RatingType: { in: RATING_TYPE_ASSESSMENT },
        },
        orderBy: (test_result, { desc }) => [
          desc(test_result.TestDate),
          desc(test_result.CreatedAtTimestamp),
        ],
        ...getTestResultsByControlIdQueryConfig,
      })
    );

    const filteredTestResults = await filter<TestResultsByControlIdResponseRow>(
      data,
      'rs_node',
      (entity) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return {
      test_result: filteredTestResults,
    };
  }

  async getLatestInternalAuditReportTestResultsByControlId(
    ctx: ServiceContext,
    controlId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.control_test_internal_audit_result.findMany({
        where: {
          ParentControlId: controlId,
        },
        orderBy: (control_test_internal_audit_result, { desc }) => [
          desc(control_test_internal_audit_result.TestDate),
          desc(control_test_internal_audit_result.CreatedAtTimestamp),
        ],
        ...getInternalAuditReportTestResultsByControlIdQueryConfig,
      })
    );

    const filteredTestResults =
      await filter<InternalAuditReportTestResultsByControlIdResponseRow>(
        data,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return {
      control_test_internal_audit_result: filteredTestResults,
    };
  }

  async getLatestComplianceMonitoringAssessmentTestResultsByControlId(
    ctx: ServiceContext,
    controlId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.control_test_second_line_result.findMany({
        where: {
          ParentControlId: controlId,
        },
        orderBy: (control_test_second_line_result, { desc }) => [
          desc(control_test_second_line_result.TestDate),
          desc(control_test_second_line_result.CreatedAtTimestamp),
        ],
        ...getComplianceMonitoringAssessmentTestResultsByControlIdQueryConfig,
      })
    );

    const filteredTestResults =
      await filter<ComplianceMonitoringAssessmentTestResultsByControlIdResponseRow>(
        data,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return {
      control_test_second_line_result: filteredTestResults,
    };
  }

  async getTestResultsByControlId(ctx: ServiceContext, controlId: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.test_result.findMany({
        where: {
          ParentControlId: controlId,
          RatingType: { in: RATING_TYPE_ASSESSMENT },
        },
        ...getTestResultsByControlIdQueryConfig,
      })
    );

    const filteredTestResults = await filter<TestResultsByControlIdResponseRow>(
      data,
      'rs_node',
      (entity) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return {
      test_result: filteredTestResults,
    };
  }

  async getInternalAuditReportTestResultsByControlId(
    ctx: ServiceContext,
    controlId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.control_test_internal_audit_result.findMany({
        where: {
          ParentControlId: controlId,
        },
        ...getInternalAuditReportTestResultsByControlIdQueryConfig,
      })
    );

    const filteredTestResults =
      await filter<InternalAuditReportTestResultsByControlIdResponseRow>(
        data,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return {
      control_test_internal_audit_result: filteredTestResults,
    };
  }

  async getComplianceMonitoringAssessmentTestResultsByControlId(
    ctx: ServiceContext,
    controlId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.control_test_second_line_result.findMany({
        where: {
          ParentControlId: controlId,
        },
        ...getComplianceMonitoringAssessmentTestResultsByControlIdQueryConfig,
      })
    );

    const filteredTestResults =
      await filter<ComplianceMonitoringAssessmentTestResultsByControlIdResponseRow>(
        data,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return {
      control_test_second_line_result: filteredTestResults,
    };
  }

  async insertControlTestResult(
    ctx: ServiceContext,
    input: CreateControlTestResultRequest
  ) {
    const result = await executeAsyncRequest(ctx, input, {
      requestType: 'CREATE_CONTROL_TEST_RESULT',
      buildRequestBody: (input) => ({
        ControlIds: input.ControlIds,
        AssessmentId: input.AssessmentId ?? null,
        Description: input.Description ?? null,
        DesignEffectiveness: input.DesignEffectiveness ?? null,
        OverallEffectiveness: input.OverallEffectiveness ?? null,
        PerformanceEffectiveness: input.PerformanceEffectiveness ?? null,
        Submitter: input.Submitter ?? null,
        TestDate: input.TestDate ?? null,
        TestType: input.TestType ?? null,
        Title: input.Title ?? null,
        CustomAttributeData: input.CustomAttributeData ?? null,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.createControlTestResult(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to create test results',
        404: 'Control(s) not found',
      },
    });

    // Refresh schedule state for each affected control
    const refreshControlScheduleState = createRefreshControlScheduleState(
      createDataLayerScheduleDataAccess()
    );
    for (const controlId of input.ControlIds) {
      try {
        await refreshControlScheduleState(toApiContext(ctx), controlId);
      } catch (error) {
        logger.warn(
          { controlId, error },
          'Failed to refresh schedule state after control test result insert'
        );
      }
    }

    return result;
  }

  async updateTestResult(ctx: ServiceContext, input: UpdateTestResultRequest) {
    const inputWithDefaults = {
      ...input,
      Submitter: input.Submitter ?? ctx.userId,
    };
    const result = await executeAsyncRequest(ctx, inputWithDefaults, {
      requestType: 'UPDATE_TEST_RESULT',
      successStatus: 200,
      buildRequestBody: (input) => ({
        Id: input.Id,
        ParentControlId: input.ParentControlId,
        Description: input.Description ?? null,
        DesignEffectiveness: input.DesignEffectiveness ?? null,
        OverallEffectiveness: input.OverallEffectiveness ?? null,
        PerformanceEffectiveness: input.PerformanceEffectiveness ?? null,
        Submitter: input.Submitter,
        TestDate: input.TestDate ?? null,
        TestType: input.TestType ?? null,
        Title: input.Title ?? null,
        CustomAttributeData: input.CustomAttributeData ?? null,
        OriginalTimestamp: input.OriginalTimestamp,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.updateTestResult(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to update this test result',
        404: 'Test result not found',
      },
    });

    // Refresh schedule state for the affected control
    const refreshControlScheduleState = createRefreshControlScheduleState(
      createDataLayerScheduleDataAccess()
    );
    try {
      await refreshControlScheduleState(
        toApiContext(ctx),
        input.ParentControlId
      );
    } catch (error) {
      logger.warn(
        { controlId: input.ParentControlId, error },
        'Failed to refresh schedule state after test result update'
      );
    }

    return result;
  }

  async deleteTestResults(ctx: ServiceContext, ids: string[]): Promise<void> {
    return executeAsyncRequest(
      ctx,
      { ids },
      {
        requestType: 'DELETE_TEST_RESULTS',
        successStatus: 204,
        buildRequestBody: (input) => ({
          Ids: input.ids,
        }),
        apiCall: (ctx, input, correlationId) =>
          dataLayerApiClient.deleteTestResults(
            toApiContext(ctx),
            input.ids,
            correlationId
          ),
        errorMessages: {
          403: 'You do not have permission to delete test results',
          404: 'Test result not found',
        },
      }
    );
  }
}
