import type { QueryConfig } from '../../db';

export const changeRequest = {
  columns: {
    Id: true,
    SequentialId: true,
    ChangeRequestStatus: true,
    ModifiedAtTimestamp: true,
    CreatedAtTimestamp: true,
    ParentId: true,
    Comment: true,
    RequestedChanges: true,
    Type: true,
    OverriddenByUser: true,
    OverriddenAtTimestamp: true,
    ActionUserId: true,
    Workflow: true,
    OrgKey: false, // Exclude from response for security
  },
} as const satisfies QueryConfig<'change_request'>;
