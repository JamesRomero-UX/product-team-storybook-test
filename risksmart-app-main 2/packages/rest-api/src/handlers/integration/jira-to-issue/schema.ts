import { IssueAssessmentStatusEnum } from 'generated/graphql';
import { ParentTypeEnum } from 'generated/graphql2';
import { z } from 'zod';

export const JiraIssueSchema = z.object({
  Issue: z.object({
    Title: z.string().min(1, { message: 'Required' }),
    Description: z.string(),
    Key: z.string().min(1),
    DepartmentName: z.string().min(1).optional(),
    ImpactsCustomer: z.boolean(),
    IsExternalIssue: z.boolean(),
    AssessmentStatus: z.nativeEnum(IssueAssessmentStatusEnum),
    DateOccurred: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
      })
      .optional(),
    DateIdentified: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
      })
      .optional(),
    OwnerAccountIds: z
      .array(z.string())
      .min(1, { message: 'At least one owner account ID is required' }),
    ContributorAccountIds: z.array(z.string()).optional(),
    CustomAttributeData: z.record(z.string(), z.any()),
    IssueAssessmentCustomAttributeData: z.record(z.string(), z.any()),
    RSUrl: z.string().url().optional(),
  }),
  RSUrlCustomFieldKey: z.string().min(1, { message: 'Required' }).optional(),
  JiraLinkCustomAttribute: z.string().optional(),
  SetRefInJira: z.boolean().optional(),
  FallbackUserId: z.string().optional(),
  IssueTypeOverride: z.nativeEnum(ParentTypeEnum).optional(),
  IssueAssessmentTypeOverride: z
    .enum([
      'near-miss',
      'material-impact',
      'internal-audit-finding',
      'compliance-finding',
      'control-test-finding',
    ])
    .optional(),
});

export const N8nJiraIssueSchema = z.object({
  jiraLinkCustomAttribute: z.string().optional(),
  setRefInJira: z.boolean().optional().default(true),
  fallbackUserId: z.string().optional(),
});
