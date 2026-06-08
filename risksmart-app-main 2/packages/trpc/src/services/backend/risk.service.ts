import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getAcceptanceListQueryConfig } from '@risksmart-app/drizzle/src/queries/acceptance.query';
import { getAppetiteListQueryConfig } from '@risksmart-app/drizzle/src/queries/appetite.query';
import { getApprovalListQueryConfig } from '@risksmart-app/drizzle/src/queries/approval.query';
import { getRiskAssessmentResultQueryConfig } from '@risksmart-app/drizzle/src/queries/assessment-result.query';
import { getControlListQueryConfig } from '@risksmart-app/drizzle/src/queries/control.query';
import { getImpactRatingListQueryConfig } from '@risksmart-app/drizzle/src/queries/impact-rating.query';
import { getIndicatorListQueryConfig } from '@risksmart-app/drizzle/src/queries/indicator.query';
import {
  getRiskItemQueryConfig,
  getRiskListQueryConfig,
} from '@risksmart-app/drizzle/src/queries/risk.query';
import { getFormConfigurationForType } from '@risksmart-app/drizzle/src/queries/utils';

import type {
  LinkedListQueryBySeqId,
  LinkedListQueryByUuidTs,
  ListQueryBySeqId,
} from '../../routers/backend/query.schema';
import {
  computePageAndMeta,
  computePageAndMetaCompound,
  sequentialIdPaginationConfig,
  uuidDateTimePaginationConfig,
} from '../../utils/pagination';
import type {
  BackendServiceContext,
  RiskBackendService,
} from '../service.types';

export class RiskServiceImpl implements RiskBackendService {
  async getRiskAssessmentResults(
    ctx: BackendServiceContext,
    opts: LinkedListQueryByUuidTs
  ) {
    const db = await createDrizzleClient(ctx);
    const listPagination = uuidDateTimePaginationConfig(opts);
    const { linkId } = opts;

    const data = await db.org(async (tx) => {
      return tx.query.risk_assessment_result.findMany({
        where: {
          ...listPagination.queryConfig.where,
          parents: {
            ParentId: linkId,
          },
        },
        limit: listPagination.queryConfig.limit,
        orderBy: (tbl, { asc, desc }) =>
          listPagination.direction === 'asc'
            ? [asc(tbl.CreatedAtTimestamp), asc(tbl.Id)]
            : [desc(tbl.CreatedAtTimestamp), desc(tbl.Id)],
        ...getRiskAssessmentResultQueryConfig,
      });
    });

    const { page, metadata } = computePageAndMetaCompound(
      {
        beforeId: opts.beforeId ?? null,
        beforeDateTime: opts.beforeDateTime ?? null,
        afterId: opts.afterId ?? null,
        afterDateTime: opts.afterDateTime ?? null,
      },
      data,
      listPagination.limit,
      'Id',
      'CreatedAtTimestamp'
    );

    return {
      pageMetadata: metadata,
      riskAssessmentResult: page,
    };
  }

  async getRiskImpactRatings(
    ctx: BackendServiceContext,
    opts: LinkedListQueryBySeqId
  ) {
    const { linkId } = opts;
    const { db, beforeSequentialId, afterSequentialId, listPagination } =
      await this.setupQuery(ctx, opts);

    const data = await db.org(async (tx) => {
      return tx.query.impact_rating.findMany({
        ...getImpactRatingListQueryConfig,
        where: {
          RatedItemId: linkId,
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

    return {
      pageMetadata: metadata,
      impactRating: page,
    };
  }

  async getRiskControls(
    ctx: BackendServiceContext,
    opts: LinkedListQueryBySeqId
  ) {
    const { linkId } = opts;
    const { db, beforeSequentialId, afterSequentialId, listPagination } =
      await this.setupQuery(ctx, opts);

    const data = await db.org(async (tx) => {
      // fetch paginated controls limited by control ids.
      return tx.query.control.findMany({
        ...getControlListQueryConfig,
        where: {
          parents: { ParentId: linkId },
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

    return {
      pageMetadata: metadata,
      control: page,
    };
  }

  async getRiskIndicators(
    ctx: BackendServiceContext,
    opts: LinkedListQueryBySeqId
  ) {
    const { linkId } = opts;
    const { db, beforeSequentialId, afterSequentialId, listPagination } =
      await this.setupQuery(ctx, opts);

    const data = await db.org(async (tx) => {
      // fetch paginated indicators limited by indicator ids.
      return tx.query.indicator.findMany({
        ...getIndicatorListQueryConfig,
        where: {
          parents: { ParentId: linkId },
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

    return {
      pageMetadata: metadata,
      indicator: page,
    };
  }

  async getRiskList(ctx: BackendServiceContext, opts: ListQueryBySeqId) {
    const { db, beforeSequentialId, afterSequentialId, listPagination } =
      await this.setupQuery(ctx, opts);

    if (!listPagination) {
      throw new Error(
        "Provide only one of 'after' or 'before' for pagination."
      );
    }

    const data = await db.org((tx) => {
      return tx.query.risk.findMany({
        ...getRiskListQueryConfig,
        ...(listPagination ? listPagination.queryConfig : {}),
      });
    });

    const { page, metadata } = computePageAndMeta(
      { beforeId: beforeSequentialId, afterId: afterSequentialId },
      data,
      listPagination.limit,
      'SequentialId'
    );

    return {
      pageMetadata: metadata,
      risk: page,
    };
  }

  async getRiskById(ctx: BackendServiceContext, riskId: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, riskData] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.Risk,
          },
        }),
        tx.query.risk.findFirst({
          ...getRiskItemQueryConfig,
          where: { Id: riskId },
        }),
      ]);

      return riskData
        ? { risk: riskData, form_configuration: formConfig ?? null }
        : null;
    });
  }

  async getRiskAppetites(
    ctx: BackendServiceContext,
    opts: LinkedListQueryBySeqId
  ) {
    const { linkId } = opts;
    const { db, beforeSequentialId, afterSequentialId, listPagination } =
      await this.setupQuery(ctx, opts);

    const data = await db.org(async (tx) => {
      // fetch paginated list limited by ids.
      return tx.query.appetite.findMany({
        ...getAppetiteListQueryConfig,
        where: {
          parents: { ParentId: linkId },
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

    return {
      pageMetadata: metadata,
      appetite: page,
    };
  }

  async getRiskAcceptances(
    ctx: BackendServiceContext,
    opts: LinkedListQueryBySeqId
  ) {
    const { linkId } = opts;
    const { db, beforeSequentialId, afterSequentialId, listPagination } =
      await this.setupQuery(ctx, opts);

    const data = await db.org(async (tx) => {
      // fetch paginated results.
      return tx.query.acceptance.findMany({
        ...getAcceptanceListQueryConfig,
        where: {
          parents: { ParentId: linkId },
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

    return {
      pageMetadata: metadata,
      acceptance: page,
    };
  }

  async getRiskApprovals(
    ctx: BackendServiceContext,
    opts: LinkedListQueryByUuidTs
  ) {
    const db = await createDrizzleClient(ctx);
    const listPagination = uuidDateTimePaginationConfig(opts);
    const { linkId } = opts;

    const data = await db.org(async (tx) => {
      return tx.query.approval.findMany({
        where: {
          ...listPagination.queryConfig.where,
          ParentId: linkId,
        },
        limit: listPagination.queryConfig.limit,
        orderBy: (tbl, { asc, desc }) =>
          listPagination.direction === 'asc'
            ? [asc(tbl.CreatedAtTimestamp), asc(tbl.Id)]
            : [desc(tbl.CreatedAtTimestamp), desc(tbl.Id)],
        ...getApprovalListQueryConfig,
      });
    });

    const { page, metadata } = computePageAndMetaCompound(
      {
        beforeId: opts.beforeId ?? null,
        beforeDateTime: opts.beforeDateTime ?? null,
        afterId: opts.afterId ?? null,
        afterDateTime: opts.afterDateTime ?? null,
      },
      data,
      listPagination.limit,
      'Id',
      'CreatedAtTimestamp'
    );

    return {
      pageMetadata: metadata,
      approval: page,
    };
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
