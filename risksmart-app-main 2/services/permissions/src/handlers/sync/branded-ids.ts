/**
 * Branded types for Permit.io resource instance IDs.
 *
 * The Permit.io integration uses composite string IDs in the format `{type}:{id}`.
 * These branded types provide compile-time safety so that raw strings cannot be
 * accidentally used where a properly-constructed resource instance ID is expected.
 */

import { z } from 'zod';

// ── Zod schemas with branded types ─────────────────────────────────────────

/** `rs_node:{id}` – regular nodes and root resource instances */
const rsNodeInstanceIdSchema = z
  .string()
  .regex(/^rs_node:.+$/, 'Expected format rs_node:{id}')
  .brand('RsNodeInstanceId');
export type RsNodeInstanceId = z.infer<typeof rsNodeInstanceIdSchema>;

/** `user_group:{id}` */
const userGroupInstanceIdSchema = z
  .string()
  .regex(/^user_group:.+$/, 'Expected format user_group:{id}')
  .brand('UserGroupInstanceId');
export type UserGroupInstanceId = z.infer<typeof userGroupInstanceIdSchema>;

/** `owner_group:{id}` */
const ownerGroupInstanceIdSchema = z
  .string()
  .regex(/^owner_group:.+$/, 'Expected format owner_group:{id}')
  .brand('OwnerGroupInstanceId');
export type OwnerGroupInstanceId = z.infer<typeof ownerGroupInstanceIdSchema>;

/** `contributor_group:{id}` */
const contributorGroupInstanceIdSchema = z
  .string()
  .regex(/^contributor_group:.+$/, 'Expected format contributor_group:{id}')
  .brand('ContributorGroupInstanceId');
export type ContributorGroupInstanceId = z.infer<
  typeof contributorGroupInstanceIdSchema
>;

/** Union of all resource instance ID types */
export type ResourceInstanceId =
  | RsNodeInstanceId
  | UserGroupInstanceId
  | OwnerGroupInstanceId
  | ContributorGroupInstanceId;

/** The type-prefix portion of a resource instance ID */
export type InstanceTypePrefix =
  | 'rs_node'
  | 'user_group'
  | 'owner_group'
  | 'contributor_group';

// ── Constructors ───────────────────────────────────────────────────────────

/** Construct an `rs_node:{id}` resource instance ID. */
export const rsNodeId = (id: string): RsNodeInstanceId =>
  rsNodeInstanceIdSchema.parse(`rs_node:${id}`);

/**
 * Construct the root resource instance ID for a given object type & org.
 * e.g. `rs_node:risk-org_Qshp7tYsxxAWwhVa`
 */
export const rootResourceInstanceId = (
  objectType: string,
  orgKey: string
): RsNodeInstanceId => rsNodeId(`${objectType}-${orgKey}`);

/** Construct a `user_group:{id}` resource instance ID. */
export const userGroupId = (id: string): UserGroupInstanceId =>
  userGroupInstanceIdSchema.parse(`user_group:${id}`);

/** Construct an `owner_group:{id}` resource instance ID. */
export const ownerGroupId = (id: string): OwnerGroupInstanceId =>
  ownerGroupInstanceIdSchema.parse(`owner_group:${id}`);

/** Construct a `contributor_group:{id}` resource instance ID. */
export const contributorGroupId = (id: string): ContributorGroupInstanceId =>
  contributorGroupInstanceIdSchema.parse(`contributor_group:${id}`);

// ── Parsing ────────────────────────────────────────────────────────────────

export const instanceTypePrefixSchema = z.enum([
  'rs_node',
  'user_group',
  'owner_group',
  'contributor_group',
]);

const resourceInstanceIdSchema = z
  .string()
  .regex(
    /^(rs_node|user_group|owner_group|contributor_group):.+$/,
    'Expected format {type}:{id}'
  )
  .transform((raw) => {
    const colonIndex = raw.indexOf(':');

    return {
      instanceType: instanceTypePrefixSchema.parse(
        raw.substring(0, colonIndex)
      ),
      id: raw.substring(colonIndex + 1),
      raw,
    };
  });

export interface ParsedResourceInstanceId {
  instanceType: InstanceTypePrefix;
  id: string;
}

/**
 * Parse a raw composite ID string into its type-prefix and id parts.
 * Returns `undefined` if the string is not a valid resource instance ID.
 */
export const parseResourceInstanceId = (
  raw: string
): ParsedResourceInstanceId | undefined => {
  const result = resourceInstanceIdSchema.safeParse(raw);
  if (!result.success) {
    return undefined;
  }

  return { instanceType: result.data.instanceType, id: result.data.id };
};

/**
 * Cast a raw string to a typed ResourceInstanceId based on its prefix.
 * Returns the branded type. Throws if the prefix is unrecognised.
 */
export const toResourceInstanceId = (raw: string): ResourceInstanceId => {
  const result = resourceInstanceIdSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid resource instance ID: ${raw}`);
  }

  return buildResourceInstanceId(result.data.instanceType, result.data.id);
};

/**
 * Build a ResourceInstanceId from its constituent parts.
 */
export const buildResourceInstanceId = (
  instanceType: InstanceTypePrefix,
  id: string
): ResourceInstanceId => {
  switch (instanceType) {
    case 'rs_node':
      return rsNodeId(id);
    case 'user_group':
      return userGroupId(id);
    case 'owner_group':
      return ownerGroupId(id);
    case 'contributor_group':
      return contributorGroupId(id);
  }
};
