import {
  defaultSchedule,
  ScheduleSchema,
} from 'src/pages/controls/update/forms/scheduleSchema';
import {
  CustomAttributeDataSchema,
  InheritedContributorSchema,
  TagsAndDepartmentsSchema,
  UserOrGroupsSchema,
} from 'src/schemas/global';
import { z } from 'zod';

export const AttestationTimeLimitSchema = z.enum([
  '1 day',
  '1 mon',
  '2 mons',
  '3 mons',
  '6 mons',
  '1 year',
  '2 years',
]);

export const AttestationFormSchema = z.object({
  requireAttestationFromEveryone: z
    .enum(['true', 'false'])
    .optional()
    .default('false'),
  attestationGroups: UserOrGroupsSchema,
  attestationTimeLimit: AttestationTimeLimitSchema.nullish(),
  attestationPromptText: z.string().nullish(),
});

export type AttestationFormFieldData = z.infer<typeof AttestationFormSchema>;

export const DocumentFormSchema = z
  .object({
    Title: z.string().min(1, { message: 'Required' }),
    Purpose: z.string({ invalid_type_error: 'Required' }).nullish(),
    DocumentType: z
      .string({ invalid_type_error: 'Required' })
      .min(1, { message: 'Required' }),
    ParentDocument: z.string().uuid().nullish(),
    linkedDocuments: z.array(
      z.object({
        value: z.string(),
      })
    ),
    Contributors: UserOrGroupsSchema,
    Owners: UserOrGroupsSchema.min(1, { message: 'Required' }),
    ancestorContributors: InheritedContributorSchema,
  })
  .and(ScheduleSchema)
  .and(AttestationFormSchema)
  .and(TagsAndDepartmentsSchema)
  .and(CustomAttributeDataSchema);

export type DocumentFormFieldData = z.infer<typeof DocumentFormSchema>;

export const defaultValues: DocumentFormFieldData = {
  Title: '',
  Purpose: null,
  ParentDocument: null,
  DocumentType: null as unknown as string,
  linkedDocuments: [],
  tags: [],
  departments: [],
  Owners: [],
  Contributors: [],
  CustomAttributeData: null,
  ancestorContributors: [],
  requireAttestationFromEveryone: 'false',
  attestationGroups: [],
  attestationTimeLimit: null,
  attestationPromptText: '',
  schedule: defaultSchedule,
};
