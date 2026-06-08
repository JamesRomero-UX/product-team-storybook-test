import type { QueryConfig } from '../db';
import { ownersAndContributors, tagsAndDepartments } from './utils';

export const getConsequencesByIdQueryConfig = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
} as const satisfies QueryConfig<'consequence'>;

export const getConsequencesRegisterQueryConfig = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
  with: {
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
    issue: {
      columns: {
        Type: true,
        SequentialId: true,
        CreatedAtTimestamp: true,
        Title: true,
      },
      with: {
        ...ownersAndContributors,
        ...tagsAndDepartments,
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
              with: {
                type: {
                  columns: {
                    OrgKey: false,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'consequence'>;

export const getConsequenceAuditByIdQueryConfig = {
  columns: {
    CostType: true,
    CostValue: true,
    Criticality: true,
    Description: true,
    Id: true,
    ParentIssueId: true,
    ModifiedAtTimestamp: true,
    CreatedAtTimestamp: true,
    Title: true,
    CreatedByUser: true,
    ModifiedByUser: true,
    CustomAttributeData: true,
    Type: true,
  },
} as const satisfies QueryConfig<'consequence_audit'>;
