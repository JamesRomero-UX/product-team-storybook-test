import { IndicatorType } from '@risksmart-app/domain/src/types/consts/indicator-type';
import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';

import {
  type ExistingOwnershipData,
  type IMutationClient,
  mutCtxFromServiceContext,
} from '../../clients/mutation-client.interface';
import {
  IndicatorMutationError,
  IndicatorNotFoundError,
  IndicatorValidationError,
  InvalidIndicatorResultError,
} from '../../errors/indicator.errors';
import type { MutateServiceContext } from '../../schemas/common/base.schema';
import type {
  CreateIndicatorRequest,
  UpdateIndicatorRequest,
} from '../../schemas/indicators/indicator-mutate-request.schema';
import type { CreateIndicatorResultRequest } from '../../schemas/indicators/indicator-result-mutate-request.schema';
import { mergeIndicatorUpdateDefaults } from '../../transformers/indicators/indicator-mutation.transformer';
import { mergeIndicatorResultUpdateDefaults } from '../../transformers/indicators/indicator-result-mutation.transformer';
import type { EntityResult } from '../../types/service';
import { logger } from '../../utils/logger';
import type { SchemaService } from '../common/schema.service';
import type { ControlsService } from '../risks/controls.service';
import type { RisksService } from '../risks/risks.service';
import type { UsersService } from '../users/users.service';
import type { IndicatorsService } from './indicators.service';

interface ResolvedParent {
  id: string;
  type: 'risk' | 'control';
}

interface IndicatorMutationServiceProps {
  mutationClient: IMutationClient;
  indicatorsService: IndicatorsService;
  risksService: RisksService;
  controlsService: ControlsService;
  usersService: UsersService;
  schemaService: SchemaService;
}

export const indicatorMutationService = (
  props: IndicatorMutationServiceProps
) => {
  const {
    mutationClient,
    indicatorsService,
    risksService,
    controlsService,
    usersService,
    schemaService,
  } = props;

  const resolveParent = async (
    parentId: string,
    ctx: MutateServiceContext
  ): Promise<ResolvedParent> => {
    // check for risk parent first.
    const risk = await risksService.getRiskById(parentId, ctx);
    if (risk) {
      return { id: parentId, type: 'risk' };
    }
    // then try for a control parent.
    const control = await controlsService.getControlById(parentId, ctx);
    if (control) {
      return { id: parentId, type: 'control' };
    }
    // error if none above found matching the parentId.
    throw new IndicatorValidationError(
      `Parent with ID ${parentId} not found. Indicators must belong to a risk or control`
    );
  };

  const getExistingIndicator = async (
    id: string,
    ctx: MutateServiceContext
  ) => {
    const fetchIndicator = await indicatorsService.getIndicatorById(id, ctx);
    if (!fetchIndicator) {
      throw new IndicatorNotFoundError(`Indicator with ID ${id} not found`);
    }

    return fetchIndicator;
  };

  const validateResultForIndicatorType = (
    indicatorType: IndicatorType,
    item: CreateIndicatorResultRequest
  ) => {
    const hasNum =
      item.targetValueNum !== null && item.targetValueNum !== undefined;
    const hasTxt =
      item.targetValueTxt !== null && item.targetValueTxt !== undefined;

    if (indicatorType === IndicatorType.Number && !hasNum) {
      throw new InvalidIndicatorResultError(
        'targetValueNum is required for number type indicator results'
      );
    }

    if (indicatorType === IndicatorType.Text && !hasTxt) {
      throw new InvalidIndicatorResultError(
        'targetValueTxt is required for text type indicator results'
      );
    }
  };

  const createIndicator = async ({
    item,
    ctx,
  }: {
    item: CreateIndicatorRequest;
    ctx: MutateServiceContext;
  }): Promise<EntityResult<{ id: string }>> => {
    await resolveParent(item.parentId, ctx);

    await usersService.validateUserIds(item.owners, ctx);

    const formConfigs = await schemaService.getResourceSchema(
      ParentTypes.Indicator,
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

    const result = await mutationClient.insertIndicator(
      { ...item, customAttributeData },
      mutCtx
    );

    const [firstError] = result.errors ?? [];
    if (firstError) {
      throw new IndicatorValidationError(
        `Failed to create indicator: ${firstError.message}`
      );
    }

    const createdId = result.data?.insertChildIndicator?.Id;
    if (!createdId) {
      throw new IndicatorMutationError(
        'Failed to create indicator: no ID returned'
      );
    }

    return { data: { id: createdId } };
  };

  const updateIndicator = async ({
    itemIds,
    item,
    ctx,
  }: {
    item: UpdateIndicatorRequest;
    ctx: MutateServiceContext;
    itemIds: { id: string };
  }): Promise<EntityResult<{ id: string }>> => {
    const { id } = itemIds;
    if (!id) {
      throw new IndicatorValidationError('Missing Indicator ID');
    }

    const existingIndicator = await getExistingIndicator(id, ctx);

    const mergedItem = mergeIndicatorUpdateDefaults(
      item,
      existingIndicator.data
    );

    await usersService.validateUserIds(mergedItem.owners, ctx);

    const customAttributeData =
      await schemaService.resolveUpdateCustomAttributeData({
        customFields: item.customFields,
        parentType: ParentTypes.Indicator,
        existingCustomAttributeData: existingIndicator.data
          .CustomAttributeData as Record<string, unknown> | null | undefined,
        ctx,
      });

    const existingOwnership: ExistingOwnershipData = {
      ownerGroupIds:
        existingIndicator.data.ownerGroups?.map((g) => g.UserGroupId) ?? [],
      contributorUserIds:
        existingIndicator.data.contributors?.map((c) => c.UserId) ?? [],
      contributorGroupIds:
        existingIndicator.data.contributorGroups?.map((g) => g.UserGroupId) ??
        [],
      tagTypeIds: existingIndicator.data.tags?.map((t) => t.TagTypeId) ?? [],
      departmentTypeIds:
        existingIndicator.data.departments?.map((d) => d.DepartmentTypeId) ??
        [],
    };

    const mutCtx = mutCtxFromServiceContext(ctx);

    const result = await mutationClient.updateIndicator(
      {
        ...mergedItem,
        id,
        type: existingIndicator.data.Type,
        customAttributeData,
        existingOwnership,
      },
      mutCtx
    );

    const [firstError] = result.errors ?? [];
    if (firstError) {
      throw new IndicatorValidationError(
        `Failed to update indicator: ${firstError.message}`
      );
    }

    const updatedId = result.data?.updateChildIndicator?.Id;
    if (!updatedId) {
      throw new IndicatorMutationError(
        'Failed to update indicator: no ID returned'
      );
    }

    return { data: { id: updatedId } };
  };

  const deleteIndicator = async ({
    id,
    ctx,
  }: {
    id: string;
    ctx: MutateServiceContext;
  }): Promise<EntityResult<{ id: string }>> => {
    const mutCtx = mutCtxFromServiceContext(ctx);
    const result = await mutationClient.deleteIndicator({ ids: [id] }, mutCtx);

    const [firstError] = result.errors ?? [];
    if (firstError) {
      throw new IndicatorValidationError(
        `Failed to delete indicator: ${firstError.message}`
      );
    }

    const deletedRows = result.data?.delete_indicator?.affected_rows ?? 0;
    if (deletedRows < 1) {
      throw new IndicatorNotFoundError(`Indicator with ID ${id} not found`);
    }

    const deletedResultRows =
      result.data?.delete_indicator_result?.affected_rows ?? 0;
    logger.info(
      { deletedResultsCount: deletedResultRows, deletedIndicatorId: id },
      'deleted indicator and child results'
    );

    return { data: { id } };
  };

  const createIndicatorResult = async ({
    item,
    ctx,
    indicatorId,
  }: {
    item: CreateIndicatorResultRequest;
    ctx: MutateServiceContext;
    indicatorId: string;
  }): Promise<EntityResult<{ id: string }>> => {
    const existing = await getExistingIndicator(indicatorId, ctx);
    validateResultForIndicatorType(existing.data.Type, item);

    const formConfigs = await schemaService.getResourceSchema(
      ParentTypes.IndicatorResult,
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

    const result = await mutationClient.insertIndicatorResult(
      { ...item, indicatorId, customAttributeData },
      mutCtx
    );

    const [firstError] = result.errors ?? [];
    if (firstError) {
      throw new IndicatorValidationError(
        `Failed to create indicator result: ${firstError.message}`
      );
    }

    const createdId = result.data?.insert_indicator_result_one?.Id;
    if (!createdId) {
      throw new IndicatorMutationError(
        'Failed to create indicator result: no ID returned'
      );
    }

    return { data: { id: createdId } };
  };

  const updateIndicatorResult = async ({
    item,
    ctx,
    itemIds,
  }: {
    item: CreateIndicatorResultRequest;
    ctx: MutateServiceContext;
    itemIds: { indicatorId: string; resultId: string };
  }): Promise<EntityResult<{ id: string }>> => {
    const { indicatorId, resultId } = itemIds;
    if (!resultId) {
      throw new IndicatorValidationError('Missing Indicator Result ID');
    }

    const existing = await getExistingIndicator(indicatorId, ctx);
    validateResultForIndicatorType(existing.data.Type, item);

    const existingResult = await indicatorsService.getIndicatorResultById(
      { id: indicatorId, resultId },
      ctx
    );
    if (!existingResult) {
      throw new IndicatorNotFoundError(
        `Indicator result with ID ${resultId} not found for indicator ${indicatorId}`
      );
    }

    const mergedItem = mergeIndicatorResultUpdateDefaults(
      item,
      existingResult.data
    );

    const customAttributeData =
      await schemaService.resolveUpdateCustomAttributeData({
        customFields: item.customFields,
        parentType: ParentTypes.IndicatorResult,
        existingCustomAttributeData: existingResult.data.CustomAttributeData as
          | Record<string, unknown>
          | null
          | undefined,
        ctx,
      });

    const mutCtx = mutCtxFromServiceContext(ctx);

    const result = await mutationClient.updateIndicatorResult(
      { ...mergedItem, resultId, customAttributeData },
      mutCtx
    );

    const [firstError] = result.errors ?? [];
    if (firstError) {
      throw new IndicatorValidationError(
        `Failed to update indicator result: ${firstError.message}`
      );
    }

    const updatedId = result.data?.update_indicator_result?.returning?.[0]?.Id;
    if (!updatedId) {
      throw new IndicatorMutationError(
        'Failed to update indicator result: no ID returned'
      );
    }

    return { data: { id: updatedId } };
  };

  const deleteIndicatorResult = async ({
    indicatorId,
    resultId,
    ctx,
  }: {
    indicatorId: string;
    resultId: string;
    ctx: MutateServiceContext;
  }): Promise<EntityResult<{ id: string }>> => {
    await getExistingIndicator(indicatorId, ctx);

    const existingResult = await indicatorsService.getIndicatorResultById(
      { id: indicatorId, resultId },
      ctx
    );
    if (!existingResult) {
      throw new IndicatorNotFoundError(
        `Indicator result with ID ${resultId} not found for indicator ${indicatorId}`
      );
    }

    const mutCtx = mutCtxFromServiceContext(ctx);
    const result = await mutationClient.deleteIndicatorResult(
      { ids: [resultId] },
      mutCtx
    );

    const [firstError] = result.errors ?? [];
    if (firstError) {
      throw new IndicatorValidationError(
        `Failed to delete indicator result: ${firstError.message}`
      );
    }

    const deletedRows =
      result.data?.delete_indicator_result?.affected_rows ?? 0;
    if (deletedRows < 1) {
      throw new IndicatorNotFoundError(
        `Indicator result with ID ${resultId} not found`
      );
    }

    return { data: { id: resultId } };
  };

  return {
    createIndicator,
    updateIndicator,
    deleteIndicator,
    createIndicatorResult,
    updateIndicatorResult,
    deleteIndicatorResult,
  };
};

export type IndicatorMutationService = ReturnType<
  typeof indicatorMutationService
>;
