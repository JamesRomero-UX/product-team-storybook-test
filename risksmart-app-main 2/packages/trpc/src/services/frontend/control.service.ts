import { IssueAssessmentStatus } from '@risksmart-app/domain/src/types/consts/index';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getControlByIdQueryConfig,
  getControlNodesQueryConfig,
  getControlRegisterQueryConfig,
  getControlsBasicQueryConfig,
  getControlsByUserIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/control.query';
import {
  getControlGroupByIdQueryConfig,
  getControlGroupsQueryConfig,
} from '@risksmart-app/drizzle/src/queries/control-group.query';
import type {
  CreateControlGroupRequest,
  CreateControlRequest,
  DeleteControlGroupRequest,
} from '@risksmart-app/events/src/types/request-types';
import { filter } from '@risksmart-app/permitio/src/permit';
import { calculateInitialScheduleState } from '@risksmart-app/schedule-state/src/utils/schedule-utils';

import { executeAsyncRequest } from '../../clients/async-request';
import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import type {
  ControlGroupResponseRow,
  ControlGroupsByTitleResponseRow,
  ControlNodesResponseRow,
  ControlsBasicResponseRow,
  ControlsByUserIdResponseRow,
} from '../../types/index';
import type { ControlService, ServiceContext } from '../service.types';

export class ControlServiceImpl implements ControlService {
  async getControlsRegister(ctx: ServiceContext, parentId?: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.control.findMany({
        where: parentId ? { parents: { ParentId: parentId } } : undefined,
        ...getControlRegisterQueryConfig,
      });
    });

    const filteredControls = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return {
      control: filteredControls.map((control) => ({
        ...control,
        actionCount: control.actions.length,
        issueCount: control.issues.length,
        openIssueCount: control.issues.filter(
          (issue) =>
            issue.issue?.assessment?.Status === IssueAssessmentStatus.Open
        ).length,
        indicatorCount: control.indicators.length,
      })),
    };
  }

  async getControlGroupsRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.control_group.findMany({
        with: {
          controls: true,
          owner: true,
        },
      });
    });

    const filteredControlsGroups = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity: (typeof data)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return {
      control_group: filteredControlsGroups,
    };
  }

  async getControlById(ctx: ServiceContext, controlId: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.control.findMany({
        where: { Id: controlId },
        ...getControlByIdQueryConfig,
      })
    );

    // Filter the control based on permissions
    const filtered = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filtered;
  }

  async getControlsByUserId(ctx: ServiceContext, userId: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.control.findMany({
        where: { CreatedByUser: userId },
        ...getControlsByUserIdQueryConfig,
      })
    );

    const filtered = await filter<ControlsByUserIdResponseRow>(
      data,
      'rs_node',
      (entity) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filtered;
  }

  async getControlGroupById(ctx: ServiceContext, controlGroupId: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.control_group.findMany({
        where: { Id: controlGroupId },
        ...getControlGroupByIdQueryConfig,
      })
    );

    return await filter<ControlGroupResponseRow>(
      data,
      'rs_node',
      (entity) => entity.Id,
      ctx.userId,
      ctx.orgId
    );
  }

  async getControlGroupsByTitle(ctx: ServiceContext, title: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.control_group.findMany({
        where: { Title: title },
        ...getControlGroupsQueryConfig,
      })
    );

    return await filter<ControlGroupsByTitleResponseRow>(
      data,
      'rs_node',
      (entity) => entity.Id,
      ctx.userId,
      ctx.orgId
    );
  }

  async getControlsBasic(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    const controls = await db.org((tx) =>
      tx.query.control.findMany({
        ...getControlsBasicQueryConfig,
      })
    );

    const nodes = await db.org((tx) =>
      tx.query.node.findMany({
        ...getControlNodesQueryConfig,
      })
    );

    const filteredControls = await filter<ControlsBasicResponseRow>(
      controls,
      'rs_node',
      (entity) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    const filteredNodes = await filter<ControlNodesResponseRow>(
      nodes,
      'rs_node',
      (entity) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return { control: filteredControls, node: filteredNodes };
  }

  async getControlGroups(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.control_group.findMany({
        ...getControlGroupsQueryConfig,
        orderBy: { Title: 'asc' },
      });
    });

    const filteredControlsGroups = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity: (typeof data)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filteredControlsGroups;
  }

  async insertControl(ctx: ServiceContext, input: CreateControlRequest) {
    const inputWithScheduleState: CreateControlRequest = {
      ...input,
      ScheduleState: input.Schedule
        ? calculateInitialScheduleState(input.Schedule)
        : null,
    };

    return executeAsyncRequest(ctx, inputWithScheduleState, {
      requestType: 'CREATE_CONTROL',
      buildRequestBody: (input) => ({
        ParentId: input.ParentId ?? null,
        Title: input.Title,
        Description: input.Description ?? null,
        Type: input.Type ?? null,
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
        dataLayerApiClient.createControl(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to create controls',
        404: 'Parent not found',
      },
    });
  }

  async insertControlGroup(
    ctx: ServiceContext,
    input: CreateControlGroupRequest
  ) {
    return executeAsyncRequest(ctx, input, {
      requestType: 'CREATE_CONTROL_GROUP',
      buildRequestBody: (input) => ({
        Title: input.Title,
        Description: input.Description,
        Owner: input.Owner,
        CustomAttributeData: input.CustomAttributeData ?? null,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.createControlGroup(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to create control groups',
      },
    });
  }

  async deleteControlGroup(
    ctx: ServiceContext,
    controlGroupId: string,
    body: DeleteControlGroupRequest
  ) {
    return executeAsyncRequest(ctx, body, {
      requestType: 'DELETE_CONTROL_GROUP',
      buildRequestBody: (input) => ({
        ...input,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.deleteControlGroup(
          toApiContext(ctx),
          controlGroupId,
          input,
          correlationId
        ),
      successStatus: 204,
      errorMessages: {
        403: 'You do not have permission to delete control groups',
        404: 'Control group not found',
      },
    });
  }
}
