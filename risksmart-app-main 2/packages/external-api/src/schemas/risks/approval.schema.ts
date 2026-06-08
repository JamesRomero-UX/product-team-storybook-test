import {
  entityIdValue,
  isoDateTimeValue,
  providerIdOrUuid,
} from '../../utils/schemas';
import { baseEntitySchema, listLinksSchema } from '../common/base.schema';
import { z } from '../openapi.zod';

// approval response schema
const approvalResponseSchema = z.object({
  id: entityIdValue,
  createdAt: isoDateTimeValue,
  updatedAt: isoDateTimeValue,
  approverId: entityIdValue.openapi({
    description: 'ID of the approver entity',
  }),
  approved: z
    .boolean()
    .openapi({ example: true, description: 'Whether the approver approved' }),
  comment: z.string().nullable().openapi({
    example: 'Approved with conditions',
    description: 'Approver comment',
  }),
});

// approval approver schema
const approvalApproverSchema = z.object({
  id: entityIdValue,
  createdAt: isoDateTimeValue,
  updatedAt: isoDateTimeValue,
  userId: providerIdOrUuid
    .nullable()
    .openapi({ description: 'User ID of the approver (if individual)' }),
  userGroupId: entityIdValue
    .nullable()
    .openapi({ description: 'User group ID of the approver (if group-based)' }),
  responses: z.array(approvalResponseSchema),
});

// approval level schema
const approvalLevelSchema = z.object({
  id: entityIdValue,
  createdAt: isoDateTimeValue,
  updatedAt: isoDateTimeValue,
  sequenceOrder: z
    .number()
    .int()
    .openapi({ example: 1, description: 'Order in the approval sequence' }),
  approvalRuleType: z.string().openapi({
    example: 'AllOf',
    description: 'Whether all or any approvers must approve',
  }),
  approvers: z.array(approvalApproverSchema),
});

// approval schemas
export const ApprovalBaseSchema = baseEntitySchema
  .omit({
    title: true,
    description: true,
    sequentialId: true,
  })
  .extend({
    links: listLinksSchema,
  });

export const ApprovalItemSchema = ApprovalBaseSchema.extend({
  workflow: z.string().nullable().openapi({
    example: 'Standard Approval',
    description: 'Approval workflow name',
  }),
  parentId: entityIdValue.openapi({
    description: 'ID of the resource requiring approval',
  }),
  levels: z.array(approvalLevelSchema),
}).strict();

export const ApprovalListSchema = z.array(ApprovalBaseSchema.strict());

export type BaseApprovalSchemaResponse = z.infer<typeof ApprovalBaseSchema>;
export type ApprovalListResponse = z.infer<typeof ApprovalListSchema>;
export type ApprovalResponse = z.infer<typeof ApprovalItemSchema>;
