import {
  ContributorsSchema,
  CustomAttributeDataSchema,
  OwnersSchema,
  ScheduleSchema,
  StringDateSchema,
  TagsAndDepartmentsSchema,
} from 'src/sharedSchemas';
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

export const AttestationSchema = z.object({
  RequireGlobalAttestation: z.boolean(),
  AttestationGroupIds: z.array(z.string().uuid()),
  AttestationTimeLimit: AttestationTimeLimitSchema.nullish(),
  AttestationPromptText: z.string().nullish(),
});

export type AttestationData = z.infer<typeof AttestationSchema>;

export const DeleteSchema = z.object({
  Id: z.string().uuid(),
});

const BaseSchema = z
  .object({
    Title: z.string().min(1, { message: 'Required' }),
    Purpose: z.string({ invalid_type_error: 'Required' }).nullish(),
    DocumentType: z
      .string({ invalid_type_error: 'Required' })
      .min(1, { message: 'Required' }),
    ParentDocument: z.string().uuid().nullish(),
    LinkedDocumentIds: z.array(z.string().uuid()),
    attestation: AttestationSchema.optional(),
  })
  .extend(ContributorsSchema)
  .extend(OwnersSchema)
  .extend(TagsAndDepartmentsSchema)
  .and(CustomAttributeDataSchema)
  .and(ScheduleSchema);

export const PostSchema = z.object({ object: BaseSchema });
export const PutSchema = z.object({
  object: BaseSchema.and(
    z.object({
      Id: z.string().uuid(),
      OriginalTimestamp: StringDateSchema,
    })
  ),
});
