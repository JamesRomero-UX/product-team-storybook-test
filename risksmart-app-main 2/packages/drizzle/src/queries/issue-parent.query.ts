import type { QueryConfig } from '../db';

export const getIssueParentQueryConfig = {
  columns: {
    IssueId: true,
    ParentId: true,
  },
  with: {
    obligation: {
      columns: {
        Id: true,
        Title: true,
      },
    },
    parent: {
      columns: {
        ObjectType: true,
        SequentialId: true,
      },
    },
  },
} as const satisfies QueryConfig<'issue_parent'>;
