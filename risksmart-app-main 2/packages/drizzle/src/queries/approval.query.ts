import type { QueryConfig } from '../db';
import { approval } from './fragments/index';

export const getApprovalListQueryConfig = {
  ...approval,
  with: {
    parent: {
      columns: {
        Id: true,
        ObjectType: true,
        SequentialId: true,
      },
    },
    createdBy: {
      columns: {
        Id: true,
        FriendlyName: true,
      },
    },
  },
} as const satisfies QueryConfig<'approval'>;

export const getApprovalByIdConfig = {
  ...approval,
  with: {
    parent: {
      columns: {
        Id: true,
        ObjectType: true,
        SequentialId: true,
      },
    },
    createdBy: {
      columns: {
        Id: true,
        FriendlyName: true,
      },
    },
    levels: {
      orderBy: {
        SequenceOrder: 'asc',
      },
      columns: {
        OrgKey: false,
      },
      with: {
        approvers: {
          columns: {
            OrgKey: false,
          },
          with: {
            responses: {
              columns: {
                OrgKey: false,
              },
            },
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'approval'>;

export const getGlobalApprovalsQueryConfig = {
  columns: {
    Id: true,
    Workflow: true,
    ModifiedAtTimestamp: true,
    CreatedAtTimestamp: true,
    ParentId: true,
  },
  with: {
    createdBy: {
      columns: {
        Id: true,
        FriendlyName: true,
      },
    },
    levels: {
      orderBy: {
        SequenceOrder: 'asc',
      },
      columns: {
        Id: true,
      },
    },
  },
} as const satisfies QueryConfig<'approval'>;
