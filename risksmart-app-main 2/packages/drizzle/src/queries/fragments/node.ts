import type { QueryConfig } from '../../db';

export const node = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'node'>;

export const enrichedNode = {
  with: {
    owners: true,
    ownerGroups: true,
    contributors: true,
    contributorGroups: true,
    targetLinkedItems: true,
    sourceLinkedItems: true,
  },
} as const satisfies QueryConfig<'node'>;
