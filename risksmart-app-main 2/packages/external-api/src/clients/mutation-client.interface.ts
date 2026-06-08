import type { IndicatorType } from '@risksmart-app/domain/src/types/consts/indicator-type';

import type {
  DeleteActionsMutation,
  DeleteIndicatorResultsMutation,
  DeleteIndicatorsMutation,
  DeleteIssuesMutation,
  DeleteRiskMutation,
  InsertChildActionMutation,
  InsertIndicatorMutation,
  InsertIndicatorResultMutation,
  InsertIssueAssessmentMutation,
  InsertIssueMutation,
  InsertRiskMutation,
  UpdateActionMutation,
  UpdateIndicatorMutation,
  UpdateIndicatorResultMutation,
  UpdateIssueAssessmentMutation,
  UpdateIssueMutation,
  UpdateRiskMutation,
} from '../generated/graphql';
import type { ExistingOwnershipData } from '../graphql/mutations/shared-transforms';
import type {
  CreateActionRequest,
  UpdateActionRequest,
} from '../schemas/actions/action-mutate-request.schema';
import type {
  CreateIndicatorRequest,
  UpdateIndicatorRequest,
} from '../schemas/indicators/indicator-mutate-request.schema';
import type {
  CreateIndicatorResultRequest,
  UpdateIndicatorResultRequest,
} from '../schemas/indicators/indicator-result-mutate-request.schema';
import type {
  CreateIssueAssessmentRequest,
  UpdateIssueAssessmentRequest,
} from '../schemas/issues/issue-assessment-mutate-request.schema';
import type {
  CreateIssueRequest,
  UpdateIssueRequest,
} from '../schemas/issues/issue-mutate-request.schema';
import type {
  CreateRiskRequest,
  UpdateRiskRequest,
} from '../schemas/risks/risk-mutate-request.schema';

export type { ExistingOwnershipData };

export interface MutationContext {
  orgId: string;
  tenantId: string;
}

export interface MutationResult<T> {
  data: T | null | undefined;
  errors?: readonly { message: string }[];
}

export type WithCustomAttributeData<T> = T & {
  customAttributeData?: Record<string, unknown> | null;
};

export type CreateRiskMutationData = WithCustomAttributeData<
  CreateRiskRequest & { tier: number }
>;
export type UpdateRiskMutationData = WithCustomAttributeData<
  UpdateRiskRequest & {
    id: string;
    tier: number;
    existingOwnership?: ExistingOwnershipData;
  }
>;

export const mutCtxFromServiceContext = (ctx: {
  orgId: string;
  tenantId: string;
}): MutationContext => ({
  orgId: ctx.orgId,
  tenantId: ctx.tenantId,
});

type InsertIssueAssessmentData = WithCustomAttributeData<
  CreateIssueAssessmentRequest & { parentIssueId: string }
>;
type UpdateIssueAssessmentData = WithCustomAttributeData<
  UpdateIssueAssessmentRequest & {
    id: string;
    originalTimestamp: string;
    existingDepartmentTypeIds?: string[];
  }
>;

export interface IMutationClient {
  insertRisk(
    data: CreateRiskMutationData,
    ctx: MutationContext
  ): Promise<MutationResult<InsertRiskMutation>>;
  updateRisk(
    data: UpdateRiskMutationData,
    ctx: MutationContext
  ): Promise<MutationResult<UpdateRiskMutation>>;
  deleteRisk(
    variables: { id: string },
    ctx: MutationContext
  ): Promise<MutationResult<DeleteRiskMutation>>;
  insertIndicator(
    data: WithCustomAttributeData<CreateIndicatorRequest>,
    ctx: MutationContext
  ): Promise<MutationResult<InsertIndicatorMutation>>;
  updateIndicator(
    data: WithCustomAttributeData<
      UpdateIndicatorRequest & {
        id: string;
        type: IndicatorType;
        existingOwnership?: ExistingOwnershipData;
      }
    >,
    ctx: MutationContext
  ): Promise<MutationResult<UpdateIndicatorMutation>>;
  deleteIndicator(
    variables: { ids: string[] },
    ctx: MutationContext
  ): Promise<MutationResult<DeleteIndicatorsMutation>>;
  insertIndicatorResult(
    data: WithCustomAttributeData<
      CreateIndicatorResultRequest & { indicatorId: string }
    >,
    ctx: MutationContext
  ): Promise<MutationResult<InsertIndicatorResultMutation>>;
  updateIndicatorResult(
    data: WithCustomAttributeData<
      UpdateIndicatorResultRequest & { resultId: string }
    >,
    ctx: MutationContext
  ): Promise<MutationResult<UpdateIndicatorResultMutation>>;
  deleteIndicatorResult(
    variables: { ids: string[] },
    ctx: MutationContext
  ): Promise<MutationResult<DeleteIndicatorResultsMutation>>;
  insertIssue(
    data: WithCustomAttributeData<CreateIssueRequest & { type: string }>,
    ctx: MutationContext
  ): Promise<MutationResult<InsertIssueMutation>>;
  updateIssue(
    data: WithCustomAttributeData<
      UpdateIssueRequest & {
        id: string;
        originalTimestamp: string;
        existingOwnership?: ExistingOwnershipData;
      }
    >,
    ctx: MutationContext
  ): Promise<MutationResult<UpdateIssueMutation>>;
  deleteIssue(
    variables: { ids: string[] },
    ctx: MutationContext
  ): Promise<MutationResult<DeleteIssuesMutation>>;
  insertAction(
    data: WithCustomAttributeData<CreateActionRequest>,
    ctx: MutationContext
  ): Promise<MutationResult<InsertChildActionMutation>>;
  updateAction(
    data: WithCustomAttributeData<
      UpdateActionRequest & {
        id: string;
        originalTimestamp: string;
        existingOwnership?: ExistingOwnershipData;
      }
    >,
    ctx: MutationContext
  ): Promise<MutationResult<UpdateActionMutation>>;
  deleteActions(
    variables: { ids: string[] },
    ctx: MutationContext
  ): Promise<MutationResult<DeleteActionsMutation>>;
  insertIssueAssessment(
    data: InsertIssueAssessmentData,
    ctx: MutationContext
  ): Promise<MutationResult<InsertIssueAssessmentMutation>>;
  updateIssueAssessment(
    data: UpdateIssueAssessmentData,
    ctx: MutationContext
  ): Promise<MutationResult<UpdateIssueAssessmentMutation>>;
}
