import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';

import {
  type ExistingOwnershipData,
  type IMutationClient,
  mutCtxFromServiceContext,
} from '../../clients/mutation-client.interface';
import {
  ActionMutationError,
  ActionNotFoundError,
  ActionValidationError,
} from '../../errors/action.errors';
import type {
  CreateActionRequest,
  UpdateActionRequest,
} from '../../schemas/actions/action-mutate-request.schema';
import type { MutateServiceContext } from '../../schemas/common/base.schema';
import { mergeActionUpdateDefaults } from '../../transformers/actions/action-mutation.transformer';
import type { EntityResult } from '../../types/service';
import type { SchemaService } from '../common/schema.service';
import type { IssuesService } from '../issues/issues.service';
import type { UsersService } from '../users/users.service';
import type { ActionsService } from './actions.service';

interface ActionMutationServiceProps {
  mutationClient: IMutationClient;
  actionsService: ActionsService;
  issuesService: IssuesService;
  usersService: UsersService;
  schemaService: SchemaService;
}

export const actionMutationService = (props: ActionMutationServiceProps) => {
  const {
    mutationClient,
    actionsService,
    issuesService,
    usersService,
    schemaService,
  } = props;

  const validateParent = async (
    parentId: string,
    ctx: MutateServiceContext
  ) => {
    const issue = await issuesService.getIssueById(parentId, ctx);
    if (!issue) {
      throw new ActionValidationError(
        `Parent with ID ${parentId} not found. Actions must belong to a valid issue`
      );
    }
  };

  const createAction = async ({
    item,
    ctx,
  }: {
    item: CreateActionRequest;
    ctx: MutateServiceContext;
  }): Promise<EntityResult<{ id: string }>> => {
    if (item.parentId) {
      await validateParent(item.parentId, ctx);
    }

    await usersService.validateUserIds(item.owners, ctx);

    const formConfigs = await schemaService.getResourceSchema(
      ParentTypes.Action,
      ctx
    );
    const customAttributeData =
      await schemaService.validateAndTransformCustomFields({
        customFields: item.customFields ?? [],
        formConfigs,
        existingCustomAttributeData: null,
        isCreate: true,
        ctx,
      });

    const mutCtx = mutCtxFromServiceContext(ctx);
    const result = await mutationClient.insertAction(
      { ...item, customAttributeData },
      mutCtx
    );

    const [firstError] = result.errors ?? [];
    if (firstError) {
      throw new ActionValidationError(
        `Failed to create action: ${firstError.message}`
      );
    }

    const createdId = result.data?.insertChildAction?.Id;
    if (!createdId) {
      throw new ActionMutationError('Failed to create action: no ID returned');
    }

    return { data: { id: createdId } };
  };

  const updateAction = async ({
    itemIds,
    item,
    ctx,
  }: {
    item: UpdateActionRequest;
    ctx: MutateServiceContext;
    itemIds: { id: string };
  }): Promise<EntityResult<{ id: string }>> => {
    const { id } = itemIds;
    if (!id) {
      throw new ActionValidationError('Missing Action ID');
    }

    const existingAction = await actionsService.getActionById(id, ctx);
    if (!existingAction) {
      throw new ActionNotFoundError(`Action with ID ${id} not found`);
    }

    const originalTimestamp =
      existingAction.data.ModifiedAtTimestamp ??
      existingAction.data.CreatedAtTimestamp;
    if (!originalTimestamp) {
      throw new ActionMutationError(
        `Failed to update action: missing original timestamp for action ID ${id}`
      );
    }

    const mergedItem = mergeActionUpdateDefaults(item, existingAction.data);

    await usersService.validateUserIds(mergedItem.owners, ctx);

    const customAttributeData =
      await schemaService.resolveUpdateCustomAttributeData({
        customFields: item.customFields,
        parentType: ParentTypes.Action,
        existingCustomAttributeData: existingAction.data.CustomAttributeData as
          | Record<string, unknown>
          | null
          | undefined,
        ctx,
      });

    const existingOwnership: ExistingOwnershipData = {
      ownerGroupIds:
        existingAction.data.ownerGroups?.map((g) => g.UserGroupId) ?? [],
      contributorUserIds:
        existingAction.data.contributors?.map((c) => c.UserId) ?? [],
      contributorGroupIds:
        existingAction.data.contributorGroups?.map((g) => g.UserGroupId) ?? [],
      tagTypeIds: existingAction.data.tags?.map((t) => t.TagTypeId) ?? [],
      departmentTypeIds:
        existingAction.data.departments?.map((d) => d.DepartmentTypeId) ?? [],
    };

    const mutCtx = mutCtxFromServiceContext(ctx);
    const result = await mutationClient.updateAction(
      {
        ...mergedItem,
        id,
        originalTimestamp,
        customAttributeData,
        existingOwnership,
      },
      mutCtx
    );

    const [firstError] = result.errors ?? [];
    if (firstError) {
      throw new ActionValidationError(
        `Failed to update action: ${firstError.message}`
      );
    }

    const affectedRows = result.data?.updateChildAction?.affected_rows ?? 0;
    if (affectedRows < 1) {
      throw new ActionNotFoundError(`Action with ID ${id} not found`);
    }

    return { data: { id } };
  };

  const deleteAction = async ({
    id,
    ctx,
  }: {
    id: string;
    ctx: MutateServiceContext;
  }): Promise<EntityResult<{ id: string }>> => {
    const mutCtx = mutCtxFromServiceContext(ctx);
    const result = await mutationClient.deleteActions({ ids: [id] }, mutCtx);

    const [firstError] = result.errors ?? [];
    if (firstError) {
      throw new ActionValidationError(
        `Failed to delete action: ${firstError.message}`
      );
    }

    const deletedRows = result.data?.deleteActionsById?.affected_rows ?? 0;
    if (deletedRows < 1) {
      throw new ActionNotFoundError(`Action with ID ${id} not found`);
    }

    return { data: { id } };
  };

  return { createAction, updateAction, deleteAction };
};

export type ActionMutationService = ReturnType<typeof actionMutationService>;
