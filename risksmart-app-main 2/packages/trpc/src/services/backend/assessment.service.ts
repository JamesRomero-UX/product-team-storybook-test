import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getAssessmentByIdQueryConfig,
  getAssessmentListQueryConfig,
} from '@risksmart-app/drizzle/src/queries/assessment.query';
import { getRiskAssessmentResultQueryConfig } from '@risksmart-app/drizzle/src/queries/assessment-result.query';
import { getFormConfigurationForType } from '@risksmart-app/drizzle/src/queries/utils';

import type {
  LinkedListQueryBySeqId,
  ListQueryBySeqId,
} from '../../routers/backend/query.schema';
import type { AssessmentListResponse } from '../../types/backend/v1/list.types';
import {
  computePageAndMeta,
  sequentialIdPaginationConfig,
} from '../../utils/pagination';
import type {
  AssessmentBackendService,
  BackendServiceContext,
} from '../service.types';

export class AssessmentServiceImpl implements AssessmentBackendService {
  async getRiskAssessmentResultById(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, data] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.RiskAssessmentResult,
          },
        }),
        tx.query.risk_assessment_result.findFirst({
          where: { Id: id },
          ...getRiskAssessmentResultQueryConfig,
        }),
      ]);

      return data
        ? {
            riskAssessmentResult: data,
            form_configuration: formConfig ?? null,
          }
        : null;
    });
  }

  async getAssessmentList(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId
  ): Promise<AssessmentListResponse> {
    const { db, beforeSequentialId, afterSequentialId, listPagination } =
      await this.setupQuery(ctx, opts);

    const data = await db.org((tx) => {
      return tx.query.assessment.findMany({
        ...getAssessmentListQueryConfig,
        ...(listPagination ? listPagination.queryConfig : {}),
      });
    });

    const { page, metadata } = computePageAndMeta(
      { beforeId: beforeSequentialId, afterId: afterSequentialId },
      data,
      listPagination.limit,
      'SequentialId'
    );

    return { pageMetadata: metadata, assessment: page };
  }

  async getAssessmentByParentIssue(
    ctx: BackendServiceContext,
    opts: LinkedListQueryBySeqId
  ): Promise<AssessmentListResponse> {
    const { linkId } = opts;
    const { db, beforeSequentialId, afterSequentialId, listPagination } =
      await this.setupQuery(ctx, opts);

    const data = await db.org((tx) => {
      return tx.query.assessment.findMany({
        ...getAssessmentListQueryConfig,
        where: {
          assessmentIssues: { ParentId: linkId },
          ...listPagination.queryConfig.where,
        },
        orderBy: listPagination.queryConfig.orderBy,
        limit: listPagination.queryConfig.limit,
      });
    });

    const { page, metadata } = computePageAndMeta(
      { beforeId: beforeSequentialId, afterId: afterSequentialId },
      data,
      listPagination.limit,
      'SequentialId'
    );

    return { pageMetadata: metadata, assessment: page };
  }

  async getAssessmentById(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, assessmentData] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.Assessment,
          },
        }),
        tx.query.assessment.findFirst({
          where: { Id: id },
          ...getAssessmentByIdQueryConfig,
        }),
      ]);

      return assessmentData
        ? { assessment: assessmentData, form_configuration: formConfig ?? null }
        : null;
    });
  }
  private async setupQuery(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId | LinkedListQueryBySeqId
  ) {
    const db = await createDrizzleClient(ctx);
    const listPagination = sequentialIdPaginationConfig(opts);
    const { beforeSequentialId = null, afterSequentialId = null } = opts ?? {};

    if (!listPagination) {
      throw new Error(
        "Provide only one of 'after' or 'before' for pagination."
      );
    }

    return { db, beforeSequentialId, afterSequentialId, listPagination };
  }
}
