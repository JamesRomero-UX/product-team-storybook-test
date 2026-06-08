import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';

import {
  type ExistingOwnershipData,
  type IMutationClient,
  mutCtxFromServiceContext,
} from '../../clients/mutation-client.interface';
import {
  IssueMutationError,
  IssueNotFoundError,
  IssueValidationError,
} from '../../errors/issue.errors';
import {
  IssueAssessmentMutationError,
  IssueAssessmentValidationError,
} from '../../errors/issue-assessment.errors';
import type { MutateServiceContext } from '../../schemas/common/base.schema';
import type {
  CreateIssueAssessmentRequest,
  UpdateIssueAssessmentRequest,
} from '../../schemas/issues/issue-assessment-mutate-request.schema';
import type {
  CreateIssueRequest,
  UpdateIssueRequest,
} from '../../schemas/issues/issue-mutate-request.schema';
import type { IssueAssessmentUpdateDefaults } from '../../transformers/issues/issue-assessment-mutation.transformer';
import { mergeIssueAssessmentUpdateDefaults } from '../../transformers/issues/issue-assessment-mutation.transformer';
import { mergeIssueUpdateDefaults } from '../../transformers/issues/issue-mutation.transformer';
import type { EntityResult } from '../../types/service';
import type { SchemaService } from '../common/schema.service';
import type { UsersService } from '../users/users.service';
import type { IssuesService } from './issues.service';

const ISSUE_TYPE = 'issue';

interface IssueMutationServiceProps {
  mutationClient: IMutationClient;
  issuesService: IssuesService;
  usersService: UsersService;
  schemaService: SchemaService;
}

export const issueMutationService = (props: IssueMutationServiceProps) => {
  const { mutationClient, issuesService, usersService, schemaService } = props;

  const validateAssessmentUser = async (
    field: 'certifiedIndividual' | 'policyOwner',
    userId: string | null | undefined,
    ctx: MutateServiceContext
  ) => {
    if (!userId) {
      return;
    }
    const user = await usersService.getUserById(userId, ctx);
    if (!user) {
      throw new IssueAssessmentValidationError(
        `${field} with ID ${userId} not found`
      );
    }
  };

  const createIssue = async ({
    item,
    ctx,
  }: {
    item: CreateIssueRequest;
    ctx: MutateServiceContext;
  }): Promise<EntityResult<{ id: string }>> => {
    await usersService.validateUserIds(item.owners, ctx);

    const formConfigs = await schemaService.getResourceSchema(
      ParentTypes.Issue,
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
    const result = await mutationClient.insertIssue(
      { ...item, type: ISSUE_TYPE, customAttributeData },
      mutCtx
    );

    const [firstError] = result.errors ?? [];
    if (firstError) {
      throw new IssueValidationError(
        `Failed to create issue: ${firstError.message}`
      );
    }

    const createdId = result.data?.insertChildIssue?.Id;
    if (!createdId) {
      throw new IssueMutationError('Failed to create issue: no ID returned');
    }

    return { data: { id: createdId } };
  };

  const updateIssue = async ({
    itemIds,
    item,
    ctx,
  }: {
    item: UpdateIssueRequest;
    ctx: MutateServiceContext;
    itemIds: { id: string };
  }): Promise<EntityResult<{ id: string }>> => {
    const { id } = itemIds;
    if (!id) {
      throw new IssueValidationError('Missing Issue ID');
    }

    const existingIssue = await issuesService.getIssueById(id, ctx);
    if (!existingIssue) {
      throw new IssueNotFoundError(`Issue with ID ${id} not found`);
    }

    const mergedItem = mergeIssueUpdateDefaults(item, existingIssue.data);

    await usersService.validateUserIds(mergedItem.owners, ctx);

    const originalTimestamp =
      existingIssue.data.ModifiedAtTimestamp ??
      existingIssue.data.CreatedAtTimestamp;
    if (!originalTimestamp) {
      throw new IssueMutationError(
        `Failed to update issue: missing original timestamp for issue ID ${id}`
      );
    }

    const customAttributeData =
      await schemaService.resolveUpdateCustomAttributeData({
        customFields: item.customFields,
        parentType: ParentTypes.Issue,
        existingCustomAttributeData: existingIssue.data.CustomAttributeData as
          | Record<string, unknown>
          | null
          | undefined,
        ctx,
      });

    const existingOwnership: ExistingOwnershipData = {
      ownerGroupIds:
        existingIssue.data.ownerGroups?.map((g) => g.UserGroupId) ?? [],
      contributorUserIds:
        existingIssue.data.contributors?.map((c) => c.UserId) ?? [],
      contributorGroupIds:
        existingIssue.data.contributorGroups?.map((g) => g.UserGroupId) ?? [],
      tagTypeIds: existingIssue.data.tags?.map((t) => t.TagTypeId) ?? [],
      departmentTypeIds:
        existingIssue.data.departments?.map((d) => d.DepartmentTypeId) ?? [],
    };

    const mutCtx = mutCtxFromServiceContext(ctx);

    const result = await mutationClient.updateIssue(
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
      throw new IssueValidationError(
        `Failed to update issue: ${firstError.message}`
      );
    }

    const affectedRows = result.data?.updateIssueApi?.affected_rows ?? 0;
    if (affectedRows < 1) {
      throw new IssueNotFoundError(`Issue with ID ${id} not found`);
    }

    return { data: { id } };
  };

  const deleteIssue = async ({
    id,
    ctx,
  }: {
    id: string;
    ctx: MutateServiceContext;
  }): Promise<EntityResult<{ id: string }>> => {
    const mutCtx = mutCtxFromServiceContext(ctx);
    const result = await mutationClient.deleteIssue({ ids: [id] }, mutCtx);

    const [firstError] = result.errors ?? [];
    if (firstError) {
      throw new IssueValidationError(
        `Failed to delete issue: ${firstError.message}`
      );
    }

    const deletedRows = result.data?.deleteIssuesById?.affected_rows ?? 0;
    if (deletedRows < 1) {
      throw new IssueNotFoundError(`Issue with ID ${id} not found`);
    }

    return { data: { id } };
  };

  const createIssueAssessment = async ({
    item,
    issueId,
    ctx,
  }: {
    item: CreateIssueAssessmentRequest;
    issueId: string;
    ctx: MutateServiceContext;
  }): Promise<EntityResult<{ id: string }>> => {
    const existingIssue = await issuesService.getIssueById(issueId, ctx);
    if (!existingIssue) {
      throw new IssueNotFoundError(`Issue with ID ${issueId} not found`);
    }

    const existingAssessment = await issuesService.getIssueAssessment(
      issueId,
      ctx
    );
    if (existingAssessment) {
      throw new IssueAssessmentValidationError(
        'An assessment already exists for this issue'
      );
    }

    await validateAssessmentUser(
      'certifiedIndividual',
      item.certifiedIndividual,
      ctx
    );
    await validateAssessmentUser('policyOwner', item.policyOwner, ctx);

    const formConfigs = await schemaService.getResourceSchema(
      ParentTypes.IssueAssessment,
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

    const result = await mutationClient.insertIssueAssessment(
      { ...item, parentIssueId: issueId, customAttributeData },
      mutCtx
    );

    const [firstError] = result.errors ?? [];
    if (firstError) {
      throw new IssueAssessmentValidationError(
        `Failed to create issue assessment: ${firstError.message}`
      );
    }

    const createdId = result.data?.insertChildIssueAssessment?.Id;
    if (!createdId) {
      throw new IssueAssessmentMutationError(
        'Failed to create issue assessment: no ID returned'
      );
    }

    return { data: { id: createdId } };
  };

  const updateIssueAssessment = async ({
    item,
    issueId,
    ctx,
  }: {
    item: UpdateIssueAssessmentRequest;
    issueId: string;
    ctx: MutateServiceContext;
  }): Promise<EntityResult<{ id: string }>> => {
    const existingIssue = await issuesService.getIssueById(issueId, ctx);
    if (!existingIssue) {
      throw new IssueNotFoundError(`Issue with ID ${issueId} not found`);
    }

    const existingAssessment = await issuesService.getIssueAssessment(
      issueId,
      ctx
    );
    if (!existingAssessment) {
      throw new IssueNotFoundError(
        `Issue assessment for issue ID ${issueId} not found`
      );
    }

    const assessmentId = existingAssessment.data.Id;
    const originalTimestamp =
      existingAssessment.data.ModifiedAtTimestamp ??
      existingAssessment.data.CreatedAtTimestamp;

    if (!originalTimestamp) {
      throw new IssueAssessmentMutationError(
        `Failed to update issue assessment: missing original timestamp for issue ID ${issueId}`
      );
    }

    const mergedItem = mergeIssueAssessmentUpdateDefaults(
      item,
      existingAssessment.data as IssueAssessmentUpdateDefaults
    );

    await validateAssessmentUser(
      'certifiedIndividual',
      mergedItem.certifiedIndividual,
      ctx
    );
    await validateAssessmentUser('policyOwner', mergedItem.policyOwner, ctx);

    const customAttributeData =
      await schemaService.resolveUpdateCustomAttributeData({
        customFields: item.customFields,
        parentType: ParentTypes.IssueAssessment,
        existingCustomAttributeData: existingAssessment.data
          .CustomAttributeData as Record<string, unknown> | null | undefined,
        ctx,
      });

    const mutCtx = mutCtxFromServiceContext(ctx);

    const existingDepartmentTypeIds =
      existingAssessment.data.departments?.map((d) => d.DepartmentTypeId) ?? [];

    const result = await mutationClient.updateIssueAssessment(
      {
        ...mergedItem,
        id: assessmentId,
        originalTimestamp,
        customAttributeData,
        existingDepartmentTypeIds,
      },
      mutCtx
    );

    const [firstError] = result.errors ?? [];
    if (firstError) {
      throw new IssueAssessmentValidationError(
        `Failed to update issue assessment: ${firstError.message}`
      );
    }

    const updatedId = result.data?.updateChildIssueAssessment?.Id;
    if (!updatedId) {
      throw new IssueAssessmentMutationError(
        'Failed to update issue assessment: no ID returned'
      );
    }

    return { data: { id: updatedId } };
  };

  return {
    createIssue,
    updateIssue,
    deleteIssue,
    createIssueAssessment,
    updateIssueAssessment,
  };
};

export type IssueMutationService = ReturnType<typeof issueMutationService>;
