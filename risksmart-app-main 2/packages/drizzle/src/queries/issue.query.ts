import { ActionStatus } from '@risksmart-app/domain/src/types/consts/action-status';

import type { QueryConfig } from '../db';
import { issue, issueAssessment } from './fragments/index';
import {
  ancestorContributors,
  ownersAndContributors,
  relationFiles,
  tagsAndDepartments,
} from './utils';

export const getIssueListQueryConfig = {
  ...issue,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    parents: {
      with: {
        parent: {
          columns: {
            Id: true,
            ObjectType: true,
            SequentialId: true,
          },
        },
        obligation: {
          columns: { Title: true },
        },
        risk: {
          columns: { Title: true },
        },
        control: {
          columns: { Title: true },
        },
        document: {
          columns: { Title: true },
        },
        assessment: {
          columns: { Title: true },
        },
        internalAuditEntity: {
          columns: { Title: true },
        },
        internalAuditReport: {
          columns: { Title: true },
        },
        complianceMonitoringAssessment: {
          columns: { Title: true },
        },
        thirdParty: {
          columns: { Title: true },
        },
      },
    },
  },
} as const satisfies QueryConfig<'issue'>;

export const getIssueByIdQueryConfig = {
  ...issue,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ...ancestorContributors,
    ...relationFiles,
  },
} as const satisfies QueryConfig<'issue'>;

export const getIssuesRegisterQueryConfig = {
  ...issue,
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
    issueUpdateSummary: {
      columns: { OrgKey: false, IssueId: false },
    },
    consequences: {
      columns: {
        CostType: true,
        CostValue: true,
        Type: true,
      },
    },
    actions: {
      with: {
        action: {
          columns: {
            Id: true,
          },
        },
      },
    },
    assessment: {
      columns: {
        OrgKey: false,
      },
      with: {
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
        certifiedIndividual: {
          columns: {
            FriendlyName: true,
          },
        },
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
    parents: {
      with: {
        parent: {
          columns: {
            Id: true,
            ObjectType: true,
            SequentialId: true,
          },
        },
        obligation: {
          columns: { Title: true },
        },
        risk: {
          columns: { Title: true },
        },
        control: {
          columns: { Title: true },
        },
        document: {
          columns: { Title: true },
        },
        assessment: {
          columns: { Title: true },
        },
        internalAuditEntity: {
          columns: { Title: true },
        },
        internalAuditReport: {
          columns: { Title: true },
        },
        complianceMonitoringAssessment: {
          columns: { Title: true },
        },
        thirdParty: {
          columns: { Title: true },
        },
      },
    },
  },
} as const satisfies QueryConfig<'issue'>;

export const myIssuesQueryConfig = {
  columns: {
    Id: true,
    Title: true,
    Details: true,
  },
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
  },
} as const satisfies QueryConfig<'issue'>;

export const myDueIssuesQueryConfig = myIssuesQueryConfig;

export const getIssuesByParentIdQueryConfig = {
  ...issue,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    assessment: {
      ...issueAssessment,
    },
  },
} as const satisfies QueryConfig<'issue'>;

export const getIssueByInternalAuditReportIdQueryConfig = {
  ...issue,
  with: {
    ...ownersAndContributors,
    ...ancestorContributors,
    ...tagsAndDepartments,
    consequences: {
      columns: {
        CostType: true,
        CostValue: true,
        Type: true,
      },
    },
    assessment: {
      ...issueAssessment,
      with: {
        modifiedByUser: { columns: { FriendlyName: true } },
        createdByUser: { columns: { FriendlyName: true } },
        certifiedIndividual: { columns: { FriendlyName: true } },
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
    actions: {
      where: { action: { Status: { eq: ActionStatus.Open } } },
      columns: { ActionId: true },
    },
    modifiedByUser: { columns: { FriendlyName: true } },
    createdByUser: { columns: { FriendlyName: true } },
    parents: {
      columns: {},
      with: {
        obligation: { columns: { Title: true, Id: true } },
        document: { columns: { Title: true, Id: true } },
        control: { columns: { Title: true, Id: true } },
        assessment: { columns: { Title: true, Id: true } },
      },
    },
  },
} as const satisfies QueryConfig<'issue'>;

export const getIssueOwnersAndTagsQueryConfig = {
  with: {
    owners: {
      columns: {
        UserId: true,
      },
      with: {
        user: {
          columns: {
            FriendlyName: true,
            Id: true,
          },
        },
      },
    },
    tags: {
      columns: {
        ParentId: true,
        TagTypeId: true,
      },
      with: {
        type: {
          columns: {
            Description: true,
            Name: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'issue'>;

export const getMyDueItemsIssuesQueryConfig = {
  columns: { Id: true, Title: true },
  with: {
    ...ownersAndContributors,
    assessment: {
      columns: {
        TargetCloseDate: true,
        Status: true,
      },
    },
  },
} as const satisfies QueryConfig<'issue'>;
