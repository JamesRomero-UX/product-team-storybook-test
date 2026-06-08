import dayjs from 'dayjs';
import z from 'zod';

import { attestationConfigSchema } from './attestation-config';
import { attestationRecordSchema } from './attestation-record';
import { documentIdSchema } from './document';
import { documentFileIdSchema } from './document-file';
import { attestationCycleIdSchema } from './types';
import type { UserId } from './user';
import { userGroupSchema } from './user-group';

export const attestationCycleStatusEnumSchema = z.enum([
  'active',
  'overdue',
  'concluded',
]);

export type AttestationCycleStatus = z.infer<
  typeof attestationCycleStatusEnumSchema
>;

const globalAudienceSchema = z.object({
  global: z.literal(true),
  userGroups: z.array(z.never()),
});

const userGroupsAudienceSchema = z.object({
  global: z.literal(false),
  userGroups: z.array(userGroupSchema),
});

export type UserGroupAudience = z.infer<typeof userGroupsAudienceSchema>;
export type GlobalAudience = z.infer<typeof globalAudienceSchema>;

const isUserGroupsAudience = (
  audience:
    | z.infer<typeof globalAudienceSchema>
    | z.infer<typeof userGroupsAudienceSchema>
): audience is z.infer<typeof userGroupsAudienceSchema> => {
  return audience.global === false;
};

const audienceUnionSchema = z.discriminatedUnion('global', [
  globalAudienceSchema,
  userGroupsAudienceSchema,
]);

export const createAttestationCycleSchema = z.object({
  allowCarryForward: z.boolean(),
  parentId: documentFileIdSchema,
  status: z.literal(attestationCycleStatusEnumSchema.enum.active),
});

export const attestationCycleSchema = createAttestationCycleSchema.extend({
  createdAtTimestamp: z.string(),
  createdByUser: z.string(),
  id: attestationCycleIdSchema,
  modifiedAtTimestamp: z.string().nullish(),
  modifiedByUser: z.string().nullish(),
  records: z.array(attestationRecordSchema),
  audience: audienceUnionSchema,
  status: attestationCycleStatusEnumSchema,
  config: attestationConfigSchema,
  concludedAtTimestamp: z.string().nullish(),
  policy: z.object({
    id: documentIdSchema,
    version: z.object({
      id: documentFileIdSchema,
    }),
  }),
});

const concludedAttestationCycleSchema = attestationCycleSchema.extend({
  status: z.literal(attestationCycleStatusEnumSchema.enum.concluded),
  concludedAtTimestamp: z.string(),
});

export type CreateAttestationCycle = z.infer<
  typeof createAttestationCycleSchema
>;
export type AttestationCycle = Readonly<z.infer<typeof attestationCycleSchema>>;

export type ConcludedAttestationCycle = Readonly<
  z.infer<typeof concludedAttestationCycleSchema>
>;

export const calculateAudience = (audience: UserGroupAudience) =>
  Array.from(new Set(audience.userGroups.flatMap((group) => group.users)));

/**
 * Returns true if attestation cycle audience includes the user in one of the user groups
 */
export const isUserInUserGroupAudience = (
  audience: z.infer<typeof audienceUnionSchema>,
  userId: UserId
) => {
  return (
    isUserGroupsAudience(audience) &&
    calculateAudience(audience).includes(userId)
  );
};

export const isConcludedAttestationCycle = (
  attestationCycle: AttestationCycle
): attestationCycle is ConcludedAttestationCycle => {
  return concludedAttestationCycleSchema.safeParse(attestationCycle).success;
};

export const canBeArchived = (
  attestationCycle: AttestationCycle
): attestationCycle is ConcludedAttestationCycle =>
  isConcludedAttestationCycle(attestationCycle);

export const canBeConcludedNaturally = (
  attestationCycle: AttestationCycle
): boolean => {
  return attestationCycle.records.every(
    (record) => record.status === 'attested' || record.status === 'not_required'
  );
};

export const asConcludedNaturally = (
  attestationCycle: AttestationCycle
): ConcludedAttestationCycle => {
  if (!canBeConcludedNaturally(attestationCycle)) {
    throw new Error(
      `Attestation cycle with id ${attestationCycle.id} cannot be concluded as not all records are attested`
    );
  }

  return asConcluded(attestationCycle);
};

export const asConcludedSuperseded = (
  attestationCycle: AttestationCycle
): ConcludedAttestationCycle => {
  // No validation - cycle is being superseded by a new one
  return asConcluded(attestationCycle);
};

const asConcluded = (
  attestationCycle: AttestationCycle
): ConcludedAttestationCycle => {
  return concludedAttestationCycleSchema.parse({
    ...attestationCycle,
    status: 'concluded',
    concludedAtTimestamp: dayjs().toISOString(),
  });
};
