import { providerIdOrUuid } from '../../utils/schemas';
import { CustomFieldsInputSchema } from '../common/custom-fields.schema';
import { z } from '../openapi.zod';

const issueAssessmentRequestFields = {
  issueType: z
    .enum([
      'near-miss',
      'material-impact',
      'internal-audit-finding',
      'compliance-finding',
      'control-test-finding',
    ])
    .nullish()
    .openapi({
      description: 'Classification of the issue type',
      example: 'compliance-finding',
    }),
  severity: z.number().int().min(1).max(5).nullish().openapi({
    description: 'Severity rating from 1 (lowest) to 5 (highest)',
    example: 3,
  }),
  targetCloseDate: z
    .string()
    .datetime({ offset: true })
    .nullish()
    .openapi({ description: 'Target date for closing the issue' }),
  actualCloseDate: z
    .string()
    .datetime({ offset: true })
    .nullish()
    .openapi({ description: 'Date the issue was actually closed' }),
  status: z.enum(['open', 'closed', 'declined', 'pending']).openapi({
    description: 'Current status of the issue assessment',
    example: 'open',
  }),
  certifiedIndividual: providerIdOrUuid.nullish().openapi({
    description: 'User ID of the individual certifying the assessment',
    example: 'provider|user-123',
  }),
  regulatoryBreach: z.boolean().nullish().openapi({
    description: 'Whether the issue constitutes a regulatory breach',
    example: false,
  }),
  regulationsBreached: z.string().nullish().openapi({
    description:
      'Description of regulations breached. Only allowed when regulatoryBreach is true',
    example: 'GDPR Article 5',
  }),
  reportable: z.boolean().nullish().openapi({
    description: 'Whether the issue is reportable to a regulator',
    example: false,
  }),
  rationale: z.string().nullish().openapi({
    description: 'Rationale or explanation for the assessment outcome',
    example: 'Control failure identified during quarterly review',
  }),
  issueCausedByThirdParty: z.boolean().nullish().openapi({
    description: 'Whether the issue was caused by a third party',
    example: false,
  }),
  thirdPartyResponsible: z.string().nullish().openapi({
    description:
      'Name of the third party responsible. Only allowed when issueCausedByThirdParty is true',
    example: 'Acme Vendor Ltd',
  }),
  issueCausedBySystemIssue: z.boolean().nullish().openapi({
    description: 'Whether the issue was caused by a system or technical fault',
    example: false,
  }),
  systemResponsible: z.string().nullish().openapi({
    description:
      'Name of the system responsible. Only allowed when issueCausedBySystemIssue is true',
    example: 'Payment Processing System',
  }),
  policyBreach: z.boolean().nullish().openapi({
    description: 'Whether the issue constitutes a breach of internal policy',
    example: false,
  }),
  policiesBreached: z.string().nullish().openapi({
    description:
      'Description of policies breached. Only allowed when policyBreach is true',
    example: 'Data Retention Policy v2.1',
  }),
  policyOwner: providerIdOrUuid.nullish().openapi({
    description: 'User ID of the policy owner accountable for this breach',
    example: 'provider|user-456',
  }),
  policyOwnerCommentary: z.string().nullish().openapi({
    description: "Policy owner's commentary on the breach",
    example: 'Remediation steps have been initiated',
  }),
  customFields: CustomFieldsInputSchema,
} as const;

const crossFieldRefinement = (
  value: {
    regulatoryBreach?: boolean | null;
    regulationsBreached?: string | null;
    issueCausedByThirdParty?: boolean | null;
    thirdPartyResponsible?: string | null;
    issueCausedBySystemIssue?: boolean | null;
    systemResponsible?: string | null;
    policyBreach?: boolean | null;
    policiesBreached?: string | null;
  },
  ctx: z.RefinementCtx
) => {
  if (value.regulationsBreached != null && value.regulatoryBreach !== true) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'regulationsBreached is only allowed when regulatoryBreach is true',
      path: ['regulationsBreached'],
    });
  }

  if (
    value.thirdPartyResponsible != null &&
    value.issueCausedByThirdParty !== true
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'thirdPartyResponsible is only allowed when issueCausedByThirdParty is true',
      path: ['thirdPartyResponsible'],
    });
  }

  if (
    value.systemResponsible != null &&
    value.issueCausedBySystemIssue !== true
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'systemResponsible is only allowed when issueCausedBySystemIssue is true',
      path: ['systemResponsible'],
    });
  }

  if (value.policiesBreached != null && value.policyBreach !== true) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'policiesBreached is only allowed when policyBreach is true',
      path: ['policiesBreached'],
    });
  }
};

export const createIssueAssessmentRequestSchema = z
  .object(issueAssessmentRequestFields)
  .superRefine(crossFieldRefinement);

export const updateIssueAssessmentRequestSchema = z
  .object(issueAssessmentRequestFields)
  .superRefine(crossFieldRefinement);

export type CreateIssueAssessmentRequest = z.infer<
  typeof createIssueAssessmentRequestSchema
>;
export type UpdateIssueAssessmentRequest = z.infer<
  typeof updateIssueAssessmentRequestSchema
>;
