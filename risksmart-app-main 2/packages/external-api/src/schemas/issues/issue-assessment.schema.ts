import {
  entityIdValue,
  isoDateTimeValue,
  providerIdOrUuid,
  referencedResourceSchema,
} from '../../utils/schemas';
import { baseLinksSchema } from '../common/base.schema';
import { z } from '../openapi.zod';

const issueAssessmentLinksSchema = baseLinksSchema
  .omit({
    owners: true,
    contributors: true,
    linkedItems: true,
  })
  .extend({
    parents: z.array(referencedResourceSchema.nullable()),
    certifiedIndividual: referencedResourceSchema.nullable(),
    policyOwner: referencedResourceSchema.nullable(),
  });

export const IssueAssessmentResponseSchema = z
  .object({
    id: entityIdValue,
    parentIssueId: entityIdValue.openapi({
      description: 'ID of the parent issue',
    }),
    issueType: z.string().nullable().openapi({
      example: 'Compliance',
      description: 'Classification of the issue',
    }),
    severity: z
      .number()
      .int()
      .nullable()
      .openapi({ example: 2, description: 'Severity level (1–5)' }),
    targetCloseDate: isoDateTimeValue
      .nullable()
      .openapi({ description: 'Target date for issue resolution' }),
    actualCloseDate: isoDateTimeValue
      .nullable()
      .openapi({ description: 'Actual date the issue was closed' }),
    status: z.string().nullable().openapi({
      example: 'Open',
      description: 'Current status of the assessment',
    }),
    certifiedIndividual: providerIdOrUuid.nullable().openapi({
      description: 'User ID of the certified individual responsible',
    }),
    regulatoryBreach: z.boolean().nullable().openapi({
      example: false,
      description: 'Whether a regulatory breach occurred',
    }),
    regulationsBreached: z.string().nullable().openapi({
      example: 'GDPR Article 32',
      description: 'Regulations that were breached',
    }),
    reportable: z.boolean().nullable().openapi({
      example: false,
      description: 'Whether the issue must be reported externally',
    }),
    rationale: z.string().nullable().openapi({
      example: 'Control failed due to process gap',
      description: 'Explanation for the assessment',
    }),
    issueCausedByThirdParty: z.boolean().nullable().openapi({
      example: false,
      description: 'Whether a third party caused the issue',
    }),
    thirdPartyResponsible: z.string().nullable().openapi({
      example: 'Acme Vendor Ltd',
      description: 'Name of the responsible third party',
    }),
    issueCausedBySystemIssue: z.boolean().nullable().openapi({
      example: false,
      description: 'Whether a system failure caused the issue',
    }),
    systemResponsible: z.string().nullable().openapi({
      example: 'CRM System v2.1',
      description: 'System responsible for the issue',
    }),
    policyBreach: z.boolean().nullable().openapi({
      example: false,
      description: 'Whether an internal policy was breached',
    }),
    policiesBreached: z.string().nullable().openapi({
      example: 'Data Retention Policy',
      description: 'Policies that were breached',
    }),
    policyOwner: providerIdOrUuid
      .nullable()
      .openapi({ description: 'User ID of the owner of the breached policy' }),
    policyOwnerCommentary: z.string().nullable().openapi({
      example: 'Policy owner confirmed breach',
      description: 'Commentary from the policy owner',
    }),
    createdAt: isoDateTimeValue,
    updatedAt: isoDateTimeValue,
    createdBy: providerIdOrUuid,
    updatedBy: providerIdOrUuid,
    links: issueAssessmentLinksSchema,
  })
  .strict();

export type IssueAssessmentResponse = z.infer<
  typeof IssueAssessmentResponseSchema
>;
