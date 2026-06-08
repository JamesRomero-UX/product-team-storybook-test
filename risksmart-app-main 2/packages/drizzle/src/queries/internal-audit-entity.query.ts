import type { QueryConfig } from '../db';
import { internalAuditEntity } from './fragments/index';
import {
  ancestorContributors,
  ownersAndContributors,
  tagsAndDepartments,
} from './utils';

export const getInternalAuditEntityRegisterQueryConfig = {
  ...internalAuditEntity,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    modifiedByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    createdByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    actions: {
      columns: {
        ActionId: true,
      },
      with: {
        action: {
          columns: {
            OrgKey: false,
          },
        },
      },
    },
    issues: {
      columns: {
        IssueId: true,
      },
      with: {
        issue: {
          columns: {
            OrgKey: false,
          },
          with: {
            assessment: {
              columns: {
                OrgKey: false,
              },
            },
          },
        },
      },
    },
    internalAuditReports: {
      columns: {
        OrgKey: false,
      },
    },
    businessArea: {
      columns: {
        Title: true,
        SequentialId: true,
        Id: true,
      },
    },
  },
} as const satisfies QueryConfig<'internal_audit_entity'>;

export const getInternalAuditByIdQueryConfig = {
  ...internalAuditEntity,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ...ancestorContributors,
    modifiedByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    createdByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    businessArea: {
      columns: {
        Title: true,
        SequentialId: true,
        Id: true,
      },
    },
  },
} as const satisfies QueryConfig<'internal_audit_entity'>;
