import { RiskStatusTypeEnum } from 'generated/graphql';
import { z } from 'zod';

/**
 * Generic schema for Jira risks - customer specific schemas should be transformed into this format
 */
export const JiraRiskSchema = z.object({
  Issue: z.object({
    Title: z.string().min(1, { message: 'Required' }),
    Description: z.string(),
    Summary: z.string().optional(),
    Status: z.nativeEnum(RiskStatusTypeEnum).nullish(),
    RSUrl: z.string().url().optional(),
    OwnerAccountId: z.string().optional(),
    OwnerEmail: z.string().email().optional(),
    ContributorAccountId: z.string().optional(),
    ContributorEmail: z.string().email().optional(),
    Key: z.string().min(1),
    Impact: z.number().int().optional(),
    Likelihood: z.number().int().optional(),
    Rating: z.number().int().optional(),
    DepartmentNames: z.array(z.string()),
  }),
  RSUrlCustomFieldKey: z.string().min(1, { message: 'Required' }),
  ParentRiskId: z.string().min(1, { message: 'Required' }),
  JiraLinkCustomAttribute: z.string().optional(),
  RiskSummaryCustomAttribute: z.string().optional(),
  SetRefInJira: z.boolean().optional(),
  FallbackUserId: z.string().optional(),
});

/**
 * Schema for n8n integration node that triggers the Jira to Risk integration
 */
export const N8nHookSchema = z.object({
  parentRiskId: z.string().uuid(),
  jiraLinkCustomAttribute: z.string().optional(),
  riskSummaryCustomAttribute: z.string().optional(),
  setRefInJira: z.boolean().optional().default(true),
  fallbackUserId: z.string().optional(),
});
