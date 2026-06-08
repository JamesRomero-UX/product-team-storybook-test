import type { QueryConfig } from '../db';
import { cause } from './fragments/index';
import { ownersAndContributors } from './utils';

export const getCauseRegisterQueryConfig = {
  ...cause,
  with: {
    issue: {
      columns: {
        Type: true,
        SequentialId: true,
        CreatedAtTimestamp: true,
        Title: true,
      },
      with: {
        ...ownersAndContributors,
        assessment: {
          columns: {
            IssueType: true,
            ActualCloseDate: true,
            Status: true,
            Severity: true,
          },
          with: {
            departments: {
              columns: {
                OrgKey: false,
              },
            },
          },
        },
      },
    },
    createdByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    modifiedByUser: {
      columns: {
        FriendlyName: true,
      },
    },
  },
} as const satisfies QueryConfig<'cause'>;

export const getCausesByParentIssueIdQueryConfig = {
  ...cause,
  with: {
    issue: {
      columns: {
        Id: true,
        Title: true,
        Details: true,
        SequentialId: true,
      },
    },
    createdByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    modifiedByUser: {
      columns: {
        FriendlyName: true,
      },
    },
  },
} as const satisfies QueryConfig<'cause'>;

export const getCauseByIdQueryConfig = {
  columns: {
    ModifiedByUser: true,
    CreatedByUser: true,
    Title: true,
    ModifiedAtTimestamp: true,
    CreatedAtTimestamp: true,
    Significance: true,
    ParentIssueId: true,
    Id: true,
    Description: true,
    CustomAttributeData: true,
  },
} as const satisfies QueryConfig<'cause'>;
