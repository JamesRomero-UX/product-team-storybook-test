import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';

import {
  type ExistingOwnershipData,
  type IMutationClient,
  mutCtxFromServiceContext,
} from '../../clients/mutation-client.interface';
import {
  InvalidRiskTierError,
  RiskMutationError,
  RiskNotFoundError,
  RiskValidationError,
} from '../../errors/risk.errors';
import type { MutateServiceContext } from '../../schemas/common/base.schema';
import type {
  CreateRiskRequest,
  UpdateRiskRequest,
} from '../../schemas/risks/risk-mutate-request.schema';
import { mergeRiskUpdateDefaults } from '../../transformers/risks/risk-mutation.transformer';
import type { EntityResult } from '../../types/service';
import type { SchemaService } from '../common/schema.service';
import type { UsersService } from '../users/users.service';
import type { RisksService } from './risks.service';

interface RiskMutationServiceProps {
  mutationClient: IMutationClient;
  risksService: RisksService;
  usersService: UsersService;
  schemaService: SchemaService;
}

export const riskMutationService = (props: RiskMutationServiceProps) => {
  const { mutationClient, risksService, usersService, schemaService } = props;

  const getExistingRisk = async (id: string, ctx: MutateServiceContext) => {
    const fetchRisk = await risksService.getRiskById(id, ctx);
    if (!fetchRisk) {
      throw new RiskNotFoundError(`Risk with ID ${id} not found`);
    }

    return fetchRisk;
  };

  /**
   * Derives the tier for a risk based on its parent:
   * - No parentRiskId - tier 1
   * - Parent found with Tier N - tier N+1 (max parent tier is 2, so max child is 3)
   * - Parent is tier 3 - throws InvalidRiskTierError (max tier depth is 3)
   */
  const deriveRiskTier = async (
    parentRiskId: string | null | undefined,
    ctx: MutateServiceContext
  ): Promise<number> => {
    if (!parentRiskId) {
      return 1;
    }

    const parentRisk = await getExistingRisk(parentRiskId, ctx);
    const parentTier = parentRisk.data.Tier;

    if (parentTier >= 3) {
      throw new InvalidRiskTierError(
        `Cannot assign a tier ${parentTier} risk as parent. Maximum tier depth is 3.`
      );
    }

    return parentTier + 1;
  };

  const deleteRisk = async ({
    id,
    ctx,
  }: {
    id: string;
    ctx: MutateServiceContext;
  }): Promise<EntityResult<{ id: string }>> => {
    const mutCtx = mutCtxFromServiceContext(ctx);
    const result = await mutationClient.deleteRisk({ id }, mutCtx);

    const [firstError] = result.errors ?? [];
    if (firstError) {
      throw new RiskValidationError(
        `Failed to delete risk: ${firstError.message}`
      );
    }

    const deletedRows = result.data?.deleteRiskById.affected_rows ?? 0;
    if (deletedRows < 1) {
      throw new RiskNotFoundError(`Risk with ID ${id} not found`);
    }

    return { data: { id } };
  };

  const updateRisk = async ({
    itemIds,
    item,
    ctx,
  }: {
    item: UpdateRiskRequest;
    ctx: MutateServiceContext;
    itemIds: { id: string };
  }): Promise<EntityResult<{ id: string }>> => {
    const { id } = itemIds;
    if (!id) {
      throw new RiskValidationError('Missing Risk ID');
    }
    const mutCtx = mutCtxFromServiceContext(ctx);

    const existingRisk = await getExistingRisk(id, ctx);

    const mergedItem = mergeRiskUpdateDefaults(item, existingRisk.data);

    if (mergedItem.parentRiskId === id) {
      throw new InvalidRiskTierError('A risk cannot be set as its own parent');
    }

    await usersService.validateUserIds(mergedItem.owners, ctx);

    const customAttributeData =
      await schemaService.resolveUpdateCustomAttributeData({
        customFields: item.customFields,
        parentType: ParentTypes.Risk,
        existingCustomAttributeData: existingRisk.data.CustomAttributeData as
          | Record<string, unknown>
          | null
          | undefined,
        ctx,
      });

    const existingOwnership: ExistingOwnershipData = {
      ownerGroupIds:
        existingRisk.data.ownerGroups?.map((g) => g.UserGroupId) ?? [],
      contributorUserIds:
        existingRisk.data.contributors?.map((c) => c.UserId) ?? [],
      contributorGroupIds:
        existingRisk.data.contributorGroups?.map((g) => g.UserGroupId) ?? [],
      tagTypeIds: existingRisk.data.tags?.map((t) => t.TagTypeId) ?? [],
      departmentTypeIds:
        existingRisk.data.departments?.map((d) => d.DepartmentTypeId) ?? [],
    };

    const tier = await deriveRiskTier(mergedItem.parentRiskId, ctx);
    const result = await mutationClient.updateRisk(
      { ...mergedItem, id, tier, customAttributeData, existingOwnership },
      mutCtx
    );

    const [firstError] = result.errors ?? [];
    if (firstError) {
      throw new RiskValidationError(
        `Failed to update risk: ${firstError.message}`
      );
    }

    const updatedId = result.data?.updateChildRisk?.Id;
    if (!updatedId) {
      throw new RiskMutationError('Failed to update risk: no ID returned');
    }

    return { data: { id: updatedId } };
  };

  const createRisk = async ({
    item,
    ctx,
  }: {
    item: CreateRiskRequest;
    ctx: MutateServiceContext;
  }): Promise<EntityResult<{ id: string }>> => {
    const mutCtx = mutCtxFromServiceContext(ctx);

    await usersService.validateUserIds(item.owners, ctx);

    const formConfigs = await schemaService.getResourceSchema(
      ParentTypes.Risk,
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

    const tier = await deriveRiskTier(item.parentRiskId, ctx);
    const result = await mutationClient.insertRisk(
      { ...item, tier, customAttributeData },
      mutCtx
    );

    const [firstError] = result.errors ?? [];
    if (firstError) {
      throw new RiskValidationError(
        `Failed to create risk: ${firstError.message}`
      );
    }

    const createdId = result.data?.insertChildRisk?.Id;
    if (!createdId) {
      throw new RiskMutationError('Failed to create risk: no ID returned');
    }

    return { data: { id: createdId } };
  };

  return { createRisk, updateRisk, deleteRisk };
};

export type RiskMutationService = ReturnType<typeof riskMutationService>;
