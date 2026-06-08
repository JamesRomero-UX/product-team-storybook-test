import z from 'zod';

/**
 * Schema for ownership filter query parameters.
 * These filters determine which items to include based on the user's ownership/contributor relationship.
 */
export const ownershipFilterSchema = z.object({
  userId: z.string(),
  owner: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  contributor: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  groupOwner: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  groupContributor: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  inheritedOwner: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  inheritedContributor: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  inheritedGroupOwner: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  inheritedGroupContributor: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
});

export type OwnershipFilter = z.infer<typeof ownershipFilterSchema>;
