import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getIssueUpdateByIdQueryConfig,
  getIssueUpdatesByParentIssueIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/issue-update.query';
import type {
  CreateIssueUpdateRequest,
  DeleteIssueUpdatesRequest,
} from '@risksmart-app/events/src/types/request-types';
import { filter } from '@risksmart-app/permitio/src/permit';

import { executeAsyncRequest } from '../../clients/async-request';
import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import type {
  GetIssueUpdateByIdResponseRow,
  GetIssueUpdatesByParentIssueIdResponseRow,
} from '../../types/index';
import type { IssueUpdateService, ServiceContext } from '../service.types';

export class IssueUpdateServiceImpl implements IssueUpdateService {
  async getIssueUpdatesByParentIssueId(ctx: ServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);
    const data = await db.org((tx) => {
      return tx.query.issue_update.findMany({
        where: {
          ParentIssueId: id,
        },
        ...getIssueUpdatesByParentIssueIdQueryConfig,
      });
    });

    const filteredIssues =
      await filter<GetIssueUpdatesByParentIssueIdResponseRow>(
        data,
        'rs_node',
        (entity: GetIssueUpdatesByParentIssueIdResponseRow) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return filteredIssues;
  }

  async getIssueUpdateById(ctx: ServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);
    const data = await db.org((tx) => {
      return tx.query.issue_update.findMany({
        where: {
          Id: id,
        },
        ...getIssueUpdateByIdQueryConfig,
      });
    });

    const filteredIssues = await filter<GetIssueUpdateByIdResponseRow>(
      data,
      'rs_node',
      (entity: GetIssueUpdateByIdResponseRow) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filteredIssues;
  }

  async insertIssueUpdate(
    ctx: ServiceContext,
    input: CreateIssueUpdateRequest
  ) {
    return executeAsyncRequest(ctx, input, {
      requestType: 'CREATE_ISSUE_UPDATE',
      buildRequestBody: (input) => ({
        ParentIssueId: input.ParentIssueId,
        Title: input.Title,
        Description: input.Description,
        CustomAttributeData: input.CustomAttributeData ?? null,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.createIssueUpdate(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to create issue updates',
        404: 'Parent issue not found',
      },
    });
  }

  async deleteIssueUpdates(
    ctx: ServiceContext,
    input: DeleteIssueUpdatesRequest
  ): Promise<void> {
    return executeAsyncRequest(
      ctx,
      { Ids: input.Ids },
      {
        requestType: 'DELETE_ISSUE_UPDATES',
        buildRequestBody: (input) => ({
          Ids: input.Ids,
        }),
        successStatus: 204,
        apiCall: (ctx, input, correlationId) =>
          dataLayerApiClient.deleteIssueUpdates(
            toApiContext(ctx),
            input,
            correlationId
          ),
        errorMessages: {
          403: 'You do not have permission to delete issue updates',
          404: 'Issue update not found',
        },
      }
    );
  }
}
