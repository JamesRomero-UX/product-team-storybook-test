import { IssueAssessmentStatus } from '@risksmart-app/domain/src/types/consts/issue-assessment-status';
import { z } from 'zod';

/** Schema for POST /issue-assessments */
export const createIssueAssessmentRequestSchema = z.object({
  ParentIssueId: z.string().uuid('ParentIssueId must be a valid UUID'),
  Severity: z.number().nullable().optional(),
  Status: z.nativeEnum(IssueAssessmentStatus).nullable().optional(),
  CertifiedIndividual: z.string().nullable().optional(),
  IssueType: z.string().nullable().optional(),
  ActualCloseDate: z.string().nullable().optional(),
  TargetCloseDate: z.string().nullable().optional(),
  PolicyOwnerCommentary: z.string().nullable().optional(),
  PolicyOwner: z.string().nullable().optional(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  PolicyBreach: z.boolean().nullable().optional(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Reportable: z.boolean().nullable().optional(),
  PoliciesBreached: z.string().nullable().optional(),
  Rationale: z.string().nullable().optional(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  IssueCausedByThirdParty: z.boolean().nullable().optional(),
  SystemResponsible: z.string().nullable().optional(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  RegulatoryBreach: z.boolean().nullable().optional(),
  RegulationsBreached: z.string().nullable().optional(),
  ThirdPartyResponsible: z.string().nullable().optional(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  IssueCausedBySystemIssue: z.boolean().nullable().optional(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
  TagTypeIds: z.array(z.string().uuid()).optional().default([]),
  DepartmentTypeIds: z.array(z.string().uuid()).optional().default([]),
  RegulationsBreachedIds: z.array(z.string().uuid()).optional().default([]),
  AssociatedControlIds: z.array(z.string().uuid()).optional().default([]),
  PoliciesBreachedIds: z.array(z.string().uuid()).optional().default([]),
});

export type CreateIssueAssessmentRequest = z.infer<
  typeof createIssueAssessmentRequestSchema
>;
