import type {
  ApprovalByIdResponse,
  RiskListApprovalResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  ApprovalListResponse,
  ApprovalResponse,
  BaseApprovalSchemaResponse,
} from '../../schemas/schema.types';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import { idToResourceReference } from '../../utils/transforms';
import { buildBaseLinks, transformParents } from '../common/base.transformer';

type InputData =
  | NonNullable<ApprovalByIdResponse>['approval']
  | RiskListApprovalResponse['approval'][0];

type ApprovalWithLevels = NonNullable<ApprovalByIdResponse>['approval'];

const transformApprovalLevels = (approval: ApprovalWithLevels) => {
  if (!('levels' in approval)) {
    return [];
  }

  return approval.levels.map((level) => ({
    id: level.Id,
    createdAt: level.CreatedAtTimestamp,
    updatedAt: level.ModifiedAtTimestamp ?? level.CreatedAtTimestamp,
    sequenceOrder: level.SequenceOrder,
    approvalRuleType: level.ApprovalRuleType ?? '',
    approvers: level.approvers.map((approver) => ({
      id: approver.Id,
      createdAt: approver.CreatedAtTimestamp,
      updatedAt: approver.ModifiedAtTimestamp ?? approver.CreatedAtTimestamp,
      userId: approver.UserId ?? null,
      userGroupId: approver.UserGroupId ?? null,
      responses: approver.responses.map((response) => ({
        id: response.Id,
        createdAt: response.CreatedAtTimestamp,
        updatedAt: response.ModifiedAtTimestamp ?? response.CreatedAtTimestamp,
        approverId: response.ApproverId,
        approved: response.Approved || false,
        comment: response.Comment ?? null,
      })),
    })),
  }));
};

const mapApprovalBaseTransform = (
  data: InputData,
  links: ReturnType<typeof createBaseLinks>
): BaseApprovalSchemaResponse => {
  return {
    id: data.Id,
    createdAt: data.CreatedAtTimestamp,
    updatedAt: data.ModifiedAtTimestamp ?? data.CreatedAtTimestamp,
    createdBy: data.createdBy?.Id ?? null,
    updatedBy: data.ModifiedByUser || data.createdBy?.Id || null,
    owners: [],
    contributors: [],
    tags: [],
    links,
  };
};

const createBaseLinks = (data: InputData, basePath: string, riskId: string) => {
  const createdBy = data.createdBy?.Id
    ? idToResourceReference(data.createdBy.Id, 'user', `${basePath}/users`)
    : null;
  const updatedBy = data.ModifiedByUser
    ? idToResourceReference(data.ModifiedByUser, 'user', `${basePath}/users`)
    : createdBy;
  const approvalResourcePath = `${basePath}/risks/${riskId}/approvals`;
  const baseLinks = buildBaseLinks(
    approvalResourcePath,
    data.Id,
    { createdBy, updatedBy },
    { ownerData: [], contributorData: [] }
  );
  const parents =
    'parent' in data && data.parent
      ? transformParents([{ parent: data.parent }], basePath)
      : [];

  return { ...baseLinks, parents };
};

export const transformApprovalItem: TransformApprovalItemFn = (
  approval,
  opts
) => {
  const { basePath, linkId } = opts;
  if (!linkId) {
    throw new Error('Link ID required for approval transforms');
  }
  const baseLinks = createBaseLinks(approval, basePath, linkId);
  const baseEntity = mapApprovalBaseTransform(approval, baseLinks);
  const levels = transformApprovalLevels(approval as ApprovalWithLevels);

  const transformedInput: ApprovalResponse = {
    ...baseEntity,
    workflow: approval.Workflow || null,
    parentId: approval.ParentId ?? '',
    levels,
  };

  return resourceSchemas.ApprovalItemSchema.parse(transformedInput);
};

export const transformApprovalList: TransformApprovalListFn = (
  result,
  opts
) => {
  const { basePath, linkId } = opts;
  if (!linkId) {
    throw new Error('Link ID required for approval transforms');
  }

  const transformedInput = result.data.map((approval) => {
    const baseLinks = createBaseLinks(approval, basePath, linkId);

    return mapApprovalBaseTransform(approval, baseLinks);
  });

  return resourceSchemas.ApprovalListSchema.parse(transformedInput);
};

export type TransformApprovalItemFn = DataEntityTransformFn<
  InputData,
  ApprovalResponse
>;

export type TransformApprovalListFn = ListDataTransformFn<
  RiskListApprovalResponse['approval'],
  ApprovalListResponse
>;
