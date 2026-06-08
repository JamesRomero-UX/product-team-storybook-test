import type { QueryConfig } from '../../db';

export const ancestorContributor = {
  columns: {
    ContributorType: true,
    UserId: true,
    Id: true,
    AncestorId: true,
    UserGroupId: true,
  },
} as const satisfies QueryConfig<'ancestor_contributor_view'>;
