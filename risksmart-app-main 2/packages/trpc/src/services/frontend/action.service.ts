import type {
  CreateActionRequest,
  CreateActionUpdateRequest,
} from '@risksmart-app/events/src/types/request-types';

import { executeAsyncRequest } from '../../clients/async-request';
import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import { mapDataLayerError } from '../../utils/error-mapping';
import type { ActionService, ServiceContext } from '../service.types';

export class ActionServiceImpl implements ActionService {
  async getById(ctx: ServiceContext, id: string) {
    try {
      const { data } = await dataLayerApiClient.getActionById(
        toApiContext(ctx),
        id
      );

      return data;
    } catch (error) {
      mapDataLayerError(error, { 404: 'Action not found' });
    }
  }

  async getActionsRegister(
    ctx: ServiceContext,
    parentId?: string,
    departmentTypeIds?: string[],
    tagTypeIds?: string[]
  ) {
    try {
      const { data } = await dataLayerApiClient.getActionsRegister(
        toApiContext(ctx),
        {
          parentId,
          departmentTypeIds,
          tagTypeIds,
        }
      );

      return {
        action: data,
      };
    } catch (error) {
      mapDataLayerError(error);
    }
  }

  async getActionUpdatesByParentActionId(
    ctx: ServiceContext,
    parentActionId: string
  ) {
    try {
      const { data } =
        await dataLayerApiClient.getActionUpdatesByParentActionId(
          toApiContext(ctx),
          parentActionId
        );

      return data.data;
    } catch (error) {
      mapDataLayerError(error, { 404: 'Parent action not found' });
    }
  }

  async getActionUpdateById(ctx: ServiceContext, id: string) {
    try {
      const { data } = await dataLayerApiClient.getActionUpdateById(
        toApiContext(ctx),
        id
      );

      return data;
    } catch (error) {
      mapDataLayerError(error, { 404: 'Action update not found' });
    }
  }

  async insertActionUpdate(
    ctx: ServiceContext,
    input: CreateActionUpdateRequest
  ) {
    return executeAsyncRequest(ctx, input, {
      requestType: 'CREATE_ACTION_UPDATE',
      buildRequestBody: (input) => ({
        ParentActionId: input.ParentActionId,
        Title: input.Title,
        Description: input.Description,
        CustomAttributeData: input.CustomAttributeData ?? null,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.createActionUpdate(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to create action updates',
        404: 'Parent action not found',
      },
    });
  }

  async deleteActionUpdates(ctx: ServiceContext, ids: string[]) {
    return executeAsyncRequest(
      ctx,
      { ids },
      {
        requestType: 'DELETE_ACTION_UPDATES',
        buildRequestBody: (input) => ({
          Ids: input.ids,
        }),
        apiCall: (ctx, input, correlationId) =>
          dataLayerApiClient.deleteActionUpdates(
            toApiContext(ctx),
            input.ids,
            correlationId
          ),
        successStatus: 204,
        errorMessages: {
          403: 'You do not have permission to delete action updates',
          404: 'Action updates not found',
        },
      }
    );
  }

  async insertAction(ctx: ServiceContext, input: CreateActionRequest) {
    return executeAsyncRequest(ctx, input, {
      requestType: 'CREATE_ACTION',
      buildRequestBody: (input) => ({
        ParentId: input.ParentId ?? null,
        Title: input.Title,
        DateDue: input.DateDue,
        DateRaised: input.DateRaised,
        Status: input.Status,
        Priority: input.Priority ?? null,
        Description: input.Description ?? null,
        ClosedDate: input.ClosedDate ?? null,
        CustomAttributeData: input.CustomAttributeData ?? null,
        OwnerUserIds: input.OwnerUserIds ?? [],
        OwnerGroupIds: input.OwnerGroupIds ?? [],
        ContributorUserIds: input.ContributorUserIds ?? [],
        ContributorGroupIds: input.ContributorGroupIds ?? [],
        TagTypeIds: input.TagTypeIds ?? [],
        DepartmentTypeIds: input.DepartmentTypeIds ?? [],
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.createAction(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to create actions',
        404: 'Parent not found',
      },
    });
  }
}
