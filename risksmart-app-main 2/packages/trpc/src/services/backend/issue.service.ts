import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getCauseByIdQueryConfig,
  getCausesByParentIssueIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/cause.query';
import { getConsequencesByIdQueryConfig } from '@risksmart-app/drizzle/src/queries/consequence.query';
import {
  getIssueByIdQueryConfig,
  getIssueListQueryConfig,
} from '@risksmart-app/drizzle/src/queries/issue.query';
import { getIssueAssessmentQueryConfig } from '@risksmart-app/drizzle/src/queries/issue-assessment.query';
import {
  getIssueUpdateByIdQueryConfig,
  getIssueUpdatesByParentIssueIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/issue-update.query';
import { getFormConfigurationForType } from '@risksmart-app/drizzle/src/queries/utils';

import type {
  LinkedListQueryByUuidTs,
  ListQueryBySeqId,
} from '../../routers/backend/query.schema';
import type { IssueListResponse } from '../../types/backend/v1/list.types';
import {
  computePageAndMeta,
  computePageAndMetaCompound,
  sequentialIdPaginationConfig,
  uuidDateTimePaginationConfig,
} from '../../utils/pagination';
import type {
  BackendServiceContext,
  IssueBackendService,
} from '../service.types';

export class IssueServiceImpl implements IssueBackendService {
  async getIssueList(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId
  ): Promise<IssueListResponse> {
    const db = await createDrizzleClient(ctx);
    const listPagination = sequentialIdPaginationConfig(opts);
    const { beforeSequentialId = null, afterSequentialId = null } = opts || {};

    if (!listPagination) {
      throw new Error(
        "Provide only one of 'after' or 'before' for pagination."
      );
    }

    const data = await db.org((tx) => {
      return tx.query.issue.findMany({
        ...getIssueListQueryConfig,
        ...(listPagination ? listPagination.queryConfig : {}),
      });
    });

    const { page, metadata } = computePageAndMeta(
      { beforeId: beforeSequentialId, afterId: afterSequentialId },
      data,
      listPagination.limit,
      'SequentialId'
    );

    return { pageMetadata: metadata, issue: page };
  }
  async getIssueById(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, issueData] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.Issue,
          },
        }),
        tx.query.issue.findFirst({
          where: { Id: id },
          ...getIssueByIdQueryConfig,
        }),
      ]);

      return issueData
        ? { issue: issueData, form_configuration: formConfig ?? null }
        : null;
    });
  }

  async getIssueConsequenceById(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, data] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.Consequence,
          },
        }),
        tx.query.consequence.findFirst({
          where: { Id: id },
          ...getConsequencesByIdQueryConfig,
        }),
      ]);

      return data
        ? { consequence: data, form_configuration: formConfig ?? null }
        : null;
    });
  }

  async getIssueCauseById(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, data] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.Cause,
          },
        }),
        tx.query.cause.findFirst({
          where: { Id: id },
          ...getCauseByIdQueryConfig,
        }),
      ]);

      return data
        ? { cause: data, form_configuration: formConfig ?? null }
        : null;
    });
  }

  async getIssueUpdateById(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, data] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.IssueUpdate,
          },
        }),
        tx.query.issue_update.findFirst({
          where: { Id: id },
          ...getIssueUpdateByIdQueryConfig,
        }),
      ]);

      return data
        ? { update: data, form_configuration: formConfig ?? null }
        : null;
    });
  }

  async getIssueConsequences(
    ctx: BackendServiceContext,
    opts: LinkedListQueryByUuidTs
  ) {
    const db = await createDrizzleClient(ctx);
    const listPagination = uuidDateTimePaginationConfig(opts);
    const { linkId } = opts;

    const data = await db.org(async (tx) => {
      return tx.query.consequence.findMany({
        where: {
          ParentIssueId: linkId,
          ...listPagination.queryConfig.where,
        },
        limit: listPagination.queryConfig.limit,
        orderBy: (tbl, { asc, desc }) =>
          listPagination.direction === 'asc'
            ? [asc(tbl.CreatedAtTimestamp), asc(tbl.Id)]
            : [desc(tbl.CreatedAtTimestamp), desc(tbl.Id)],
        ...getConsequencesByIdQueryConfig,
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
      consequence: page,
    };
  }
  async getIssueCauses(
    ctx: BackendServiceContext,
    opts: LinkedListQueryByUuidTs
  ) {
    const db = await createDrizzleClient(ctx);
    const listPagination = uuidDateTimePaginationConfig(opts);
    const { linkId } = opts;

    const data = await db.org(async (tx) => {
      return tx.query.cause.findMany({
        where: {
          ParentIssueId: linkId,
          ...listPagination.queryConfig.where,
        },
        limit: listPagination.queryConfig.limit,
        orderBy: (tbl, { asc, desc }) =>
          listPagination.direction === 'asc'
            ? [asc(tbl.CreatedAtTimestamp), asc(tbl.Id)]
            : [desc(tbl.CreatedAtTimestamp), desc(tbl.Id)],
        ...getCausesByParentIssueIdQueryConfig,
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
      cause: page,
    };
  }
  async getIssueUpdates(
    ctx: BackendServiceContext,
    opts: LinkedListQueryByUuidTs
  ) {
    const db = await createDrizzleClient(ctx);
    const listPagination = uuidDateTimePaginationConfig(opts);
    const { linkId } = opts;

    const data = await db.org(async (tx) => {
      return tx.query.issue_update.findMany({
        where: {
          ParentIssueId: linkId,
          ...listPagination.queryConfig.where,
        },
        limit: listPagination.queryConfig.limit,
        orderBy: (tbl, { asc, desc }) =>
          listPagination.direction === 'asc'
            ? [asc(tbl.CreatedAtTimestamp), asc(tbl.Id)]
            : [desc(tbl.CreatedAtTimestamp), desc(tbl.Id)],
        ...getIssueUpdatesByParentIssueIdQueryConfig,
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
      update: page,
    };
  }

  async getIssueAssessment(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, data] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.IssueAssessment,
          },
        }),
        tx.query.issue_assessment.findFirst({
          where: { ParentIssueId: id },
          ...getIssueAssessmentQueryConfig,
        }),
      ]);

      return data
        ? { issueAssessment: data, form_configuration: formConfig ?? null }
        : null;
    });
  }
}
