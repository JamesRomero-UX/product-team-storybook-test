import { Issue_Assessment_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { Requiredish } from 'src/components/form';
import { z } from 'zod';

import {
  CustomAttributeDataSchema,
  NullableStringDateSchema,
  TagsAndDepartmentsSchema,
  UserOptionSchema,
} from '../../../../../schemas/global';

export const IssueAssessmentSchema = z
  .object({
    Severity: z.number().nullish(),
    CertifiedIndividual: UserOptionSchema.nullish(),
    IssueType: z.string().nullish(),
    ActualCloseDate: NullableStringDateSchema,
    TargetCloseDate: NullableStringDateSchema,
    Status: z.nativeEnum(Issue_Assessment_Status_Enum).nullish(),
    PolicyOwnerCommentary: z.string().nullish(),
    PolicyOwner: UserOptionSchema.nullish(),
    PolicyBreach: z.boolean().nullish(),
    AssociatedControlIds: z.array(z.object({ value: z.string().uuid() })),
    RegulatoryBreach: z.boolean().nullish(),
    RegulationsBreach: z.string().nullish(),
    Reportable: z.boolean().nullish(),
    PoliciesBreached: z.string().nullish(),
    PoliciesBreachedIds: z.array(z.object({ value: z.string().uuid() })),
    Rationale: z.string().nullish(),
    IssueCausedByThirdParty: z.boolean().nullish(),
    SystemResponsible: z.string().nullish(),
    RegulationsBreached: z.string().nullish(),
    RegulationsBreachedIds: z.array(z.object({ value: z.string().uuid() })),
    ThirdPartyResponsible: z.string().nullish(),
    IssueCausedBySystemIssue: z.boolean().nullish(),
  })
  .and(CustomAttributeDataSchema)
  .and(TagsAndDepartmentsSchema);

export type IssueAssessmentFields = Requiredish<
  z.infer<typeof IssueAssessmentSchema>
>;

export const defaultValues: IssueAssessmentFields = {
  ActualCloseDate: null,
  ThirdPartyResponsible: null,
  TargetCloseDate: null,
  PolicyOwnerCommentary: null,
  AssociatedControlIds: [],
  CertifiedIndividual: null,
  IssueCausedBySystemIssue: null,
  IssueCausedByThirdParty: null,
  IssueType: null,
  tags: [],
  departments: [],
  PoliciesBreached: null,
  PolicyOwner: null,
  PolicyBreach: null,
  PoliciesBreachedIds: [],
  Rationale: null,
  RegulatoryBreach: null,
  Reportable: null,
  Severity: null,
  Status: Issue_Assessment_Status_Enum.Pending,
  SystemResponsible: null,
  RegulationsBreached: null,
  RegulationsBreachedIds: [],
  RegulationsBreach: null,
  CustomAttributeData: null,
};
