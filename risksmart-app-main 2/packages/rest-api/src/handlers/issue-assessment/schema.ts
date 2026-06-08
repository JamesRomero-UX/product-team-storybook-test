import { IssueAssessmentStatusEnum } from 'generated/graphql';
import {
  CustomAttributeDataSchema,
  NullableStringDateSchema,
  StringDateSchema,
  TagsAndDepartmentsSchema,
} from 'src/sharedSchemas';
import { z } from 'zod';

const Shared = z
  .object({
    Severity: z.number().nullable(),
    CertifiedIndividual: z.string().nullable(),
    IssueType: z.string().nullable(),
    ActualCloseDate: NullableStringDateSchema,
    TargetCloseDate: NullableStringDateSchema,
    Status: z.nativeEnum(IssueAssessmentStatusEnum).nullable(),
    PolicyOwnerCommentary: z.string().nullable(),
    PolicyOwner: z.string().nullable(),
    PolicyBreach: z.boolean().nullable(),
    AssociatedControlIds: z.array(z.string().uuid()),
    Reportable: z.boolean().nullable(),
    PoliciesBreached: z.string().nullable(),
    PoliciesBreachedIds: z.array(z.string().uuid()),
    Rationale: z.string().nullable(),
    IssueCausedByThirdParty: z.boolean().nullable(),
    SystemResponsible: z.string().nullable(),
    RegulatoryBreach: z.boolean().nullable(),
    RegulationsBreached: z.string().nullable(),
    RegulationsBreachedIds: z.array(z.string().uuid()),
    ThirdPartyResponsible: z.string().nullable(),
    IssueCausedBySystemIssue: z.boolean().nullable(),
  })
  .extend(TagsAndDepartmentsSchema)
  .and(CustomAttributeDataSchema);

export const PostSchema = Shared.and(
  z.object({
    ParentIssueId: z.string().uuid(),
  })
);

export const PutSchema = Shared.and(
  z.object({
    OriginalTimestamp: StringDateSchema,
    Id: z.string().uuid(),
  })
);
