import type { ParentType } from '@risksmart-app/domain/src/types/consts/index';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getIssueByIdQueryConfig,
  getIssueOwnersAndTagsQueryConfig,
  getIssuesByParentIdQueryConfig,
  getIssuesRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/issue.query';
import { getIssueAssessmentQueryConfig } from '@risksmart-app/drizzle/src/queries/issue-assessment.query';
import { getIssueParentQueryConfig } from '@risksmart-app/drizzle/src/queries/issue-parent.query';
import type {
  CreateIssueRequest,
  UpdateIssueRequest,
} from '@risksmart-app/events/src/types/request-types';
import { filter } from '@risksmart-app/permitio/src/permit';

import { executeAsyncRequest } from '../../clients/async-request';
import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import type {
  IssueAssessmentParentResponseRow,
  IssueAssessmentResponseRow,
} from '../../types/index';
import type {
  GetIssueByIdResponseRow,
  GetIssueOwnersAndTagsResponseRow,
  GetIssuesByParentIdResponseRow,
} from '../../types/issue.types';
import type { IssueService, ServiceContext } from '../service.types';

export class IssueServiceImpl implements IssueService {
  async getById(ctx: ServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);
    const data = await db.org((tx) => {
      return tx.query.issue.findMany({
        where: {
          Id: id,
        },
        ...getIssueByIdQueryConfig,
      });
    });

    const filteredIssues = await filter<GetIssueByIdResponseRow>(
      data,
      'rs_node',
      (entity: GetIssueByIdResponseRow) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filteredIssues;
  }

  async getIssuesRegister(
    ctx: ServiceContext,
    issueType: ParentType,
    departmentTypeIds?: string[],
    tagTypeIds?: string[]
  ) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.issue.findMany({
        where: {
          Type: issueType,
          ...(tagTypeIds && {
            tags: {
              TagTypeId: { in: tagTypeIds },
            },
          }),
          ...(departmentTypeIds && {
            departments: {
              DepartmentTypeId: { in: departmentTypeIds },
            },
          }),
        },
        ...getIssuesRegisterQueryConfig,
      });
    });

    const filteredIssues = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity: (typeof data)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return {
      issue: filteredIssues,
    };
  }

  async getIssuesByParentId(
    ctx: ServiceContext,
    parentId: string,
    type: ParentType
  ) {
    const db = await createDrizzleClient(ctx);
    const data = await db.org((tx) => {
      return tx.query.issue.findMany({
        where: {
          parents: { ParentId: parentId },
          Type: type,
        },
        ...getIssuesByParentIdQueryConfig,
      });
    });

    const filteredIssues = await filter<GetIssuesByParentIdResponseRow>(
      data,
      'rs_node',
      (entity) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filteredIssues;
  }

  async getIssueAssessmentByParentId(
    ctx: ServiceContext,
    parentIssueId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const [
      issueAssessmentResults,
      issueOwnersAndTagsResults,
      issueParentResults,
    ] = await Promise.all([
      db.org((tx) =>
        tx.query.issue_assessment.findMany({
          where: {
            ParentIssueId: parentIssueId,
          },
          ...getIssueAssessmentQueryConfig,
        })
      ),
      db.org((tx) =>
        tx.query.issue.findMany({
          where: {
            Id: parentIssueId,
          },
          ...getIssueOwnersAndTagsQueryConfig,
        })
      ),
      db.org((tx) =>
        tx.query.issue_parent.findMany({
          where: {
            IssueId: parentIssueId,
          },
          ...getIssueParentQueryConfig,
        })
      ),
    ]);

    const [
      filteredIssueAssessmentResults,
      filteredIssueOwnersAndTagsResults,
      filteredIssueParentResults,
    ] = await Promise.all([
      filter<IssueAssessmentResponseRow>(
        issueAssessmentResults,
        'rs_node',
        (entity) => entity.ParentIssueId,
        ctx.userId,
        ctx.orgId
      ),
      filter<GetIssueOwnersAndTagsResponseRow>(
        issueOwnersAndTagsResults,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      ),
      filter<IssueAssessmentParentResponseRow>(
        issueParentResults,
        'rs_node',
        (entity) => entity.IssueId,
        ctx.userId,
        ctx.orgId
      ),
    ]);

    return {
      issue_assessment: filteredIssueAssessmentResults,
      issue: filteredIssueOwnersAndTagsResults,
      issue_parent: filteredIssueParentResults,
    };
  }

  async insertIssue(ctx: ServiceContext, input: CreateIssueRequest) {
    return executeAsyncRequest(ctx, input, {
      requestType: 'CREATE_ISSUE',
      buildRequestBody: (input) => ({
        ParentId: input.ParentId ?? null,
        Title: input.Title,
        Details: input.Details ?? null,
        ImpactsCustomer: input.ImpactsCustomer ?? null,
        IsExternalIssue: input.IsExternalIssue ?? null,
        DateOccurred: input.DateOccurred,
        DateIdentified: input.DateIdentified,
        Type: input.Type,
        CustomAttributeData: input.CustomAttributeData ?? null,
        Meta: input.Meta ?? null,
        OwnerUserIds: input.OwnerUserIds ?? [],
        OwnerGroupIds: input.OwnerGroupIds ?? [],
        ContributorUserIds: input.ContributorUserIds ?? [],
        ContributorGroupIds: input.ContributorGroupIds ?? [],
        TagTypeIds: input.TagTypeIds ?? [],
        DepartmentTypeIds: input.DepartmentTypeIds ?? [],
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.createIssue(toApiContext(ctx), input, correlationId),
    });
  }

  async updateIssue(ctx: ServiceContext, input: UpdateIssueRequest) {
    return executeAsyncRequest(ctx, input, {
      requestType: 'UPDATE_ISSUE',
      successStatus: 200,
      buildRequestBody: (input) => ({
        Id: input.Id,
        Title: input.Title,
        Details: input.Details ?? null,
        ImpactsCustomer: input.ImpactsCustomer ?? null,
        IsExternalIssue: input.IsExternalIssue ?? null,
        DateOccurred: input.DateOccurred,
        DateIdentified: input.DateIdentified,
        Type: input.Type,
        CustomAttributeData: input.CustomAttributeData ?? null,
        Meta: input.Meta ?? null,
        OwnerUserIds: input.OwnerUserIds ?? [],
        OwnerGroupIds: input.OwnerGroupIds ?? [],
        ContributorUserIds: input.ContributorUserIds ?? [],
        ContributorGroupIds: input.ContributorGroupIds ?? [],
        TagTypeIds: input.TagTypeIds ?? [],
        DepartmentTypeIds: input.DepartmentTypeIds ?? [],
        OriginalTimestamp: input.OriginalTimestamp,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.updateIssue(toApiContext(ctx), input, correlationId),
      errorMessages: {
        403: 'You do not have permission to update this issue',
        404: 'Issue not found',
        409: 'Record has been modified by another user. Please refresh and try again.',
      },
    });
  }

  async deleteIssues(ctx: ServiceContext, ids: string[]): Promise<void> {
    return executeAsyncRequest(
      ctx,
      { Ids: ids },
      {
        requestType: 'DELETE_ISSUES',
        successStatus: 204,
        buildRequestBody: (input) => ({
          Ids: input.Ids,
        }),
        apiCall: (ctx, input, correlationId) =>
          dataLayerApiClient.deleteIssues(
            toApiContext(ctx),
            input,
            correlationId
          ),
        errorMessages: {
          403: 'You do not have permission to delete issues',
          404: 'One or more issues not found',
        },
      }
    );
  }
}
