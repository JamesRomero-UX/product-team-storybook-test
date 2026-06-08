import { UserOrGroupsSchema } from 'src/schemas/global';
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

const commonFields = z.object({
  attestationTimeLimit: AttestationTimeLimitSchema.nullish(),
  attestationPromptText: z.string().nullish(),
  requireReattestation: z.enum(['true', 'false']),
});

export const globalAttestationsSchema = commonFields.extend({
  requireAttestationFromEveryone: z.enum(['true']),
});

export const groupAttestationsSchema = commonFields.extend({
  requireAttestationFromEveryone: z.enum(['false']),
  attestationGroups: UserOrGroupsSchema.min(1, {
    message:
      'You must select at least one group or user when attestation is not required from everyone',
  }),
});

export const AttestationFormSchema = z.discriminatedUnion(
  'requireAttestationFromEveryone',
  [globalAttestationsSchema, groupAttestationsSchema]
);

export type AttestationFormFieldData = z.infer<typeof AttestationFormSchema>;

export const defaultValues: AttestationFormFieldData = {
  attestationGroups: [],
  attestationPromptText: '',
  requireReattestation: 'true',
  attestationTimeLimit: null,
  requireAttestationFromEveryone: 'false',
};
