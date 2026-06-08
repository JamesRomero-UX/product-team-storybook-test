import type { QueryConfig } from '../db';
import { action, actionUpdate } from './fragments/index';
import {
  ancestorContributors,
  ownersAndContributors,
  relationFiles,
  tagsAndDepartments,
} from './utils';

export const getActionsRegisterQueryConfig = {
  ...action,
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
    actionUpdateSummary: {
      columns: { OrgKey: false, ActionId: false },
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
        action: {
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
        issue: {
          columns: { Title: true, Type: true },
        },
      },
    },
  },
} as const satisfies QueryConfig<'action'>;

export const getActionByIdQueryConfig = {
  ...action,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ...ancestorContributors,
    ...relationFiles,
  },
} as const satisfies QueryConfig<'action'>;

export const getActionUpdatesByParentActionIdQueryConfig = {
  ...actionUpdate,
  with: {
    createdByUser: {
      columns: {
        FriendlyName: true,
      },
    },
  },
} as const satisfies QueryConfig<'action_update'>;

export const getActionUpdateByIdQueryConfig = {
  ...actionUpdate,
  with: { ...relationFiles },
} as const satisfies QueryConfig<'action_update'>;

export const getActionListQueryConfig = {
  ...action,
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
        action: {
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
        issue: {
          columns: { Title: true, Type: true },
        },
      },
    },
  },
} as const satisfies QueryConfig<'action'>;

export const myActionsQueryConfig = {
  columns: {
    Id: true,
    Title: true,
    Description: true,
  },
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
  },
} as const satisfies QueryConfig<'action'>;

export const myDueActionsQueryConfig = {
  columns: {
    Id: true,
    Title: true,
    DateDue: true,
    Status: true,
  },
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
  },
} as const satisfies QueryConfig<'action'>;

export const getActionsByInternalAuditReportIdQueryConfig = {
  ...action,
  with: {
    ...ownersAndContributors,
    ...ancestorContributors,
    ...tagsAndDepartments,
    parents: {
      columns: {},
      with: {
        parent: {
          columns: { Id: true, ObjectType: true, SequentialId: true },
        },
        obligation: { columns: { Title: true, Id: true } },
        document: { columns: { Title: true, Id: true } },
        control: { columns: { Title: true, Id: true } },
        assessment: { columns: { Title: true, Id: true } },
        risk: { columns: { Title: true, Id: true } },
        issue: { columns: { Title: true, Id: true, Type: true } },
      },
    },
    updates: {
      ...actionUpdate,
      orderBy: { CreatedAtTimestamp: 'desc' },
    },
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
  },
} as const satisfies QueryConfig<'action'>;

export const getMyDueItemsActionsQueryConfig = {
  columns: { Id: true, Title: true, DateDue: true, Status: true },
  with: {
    ...ownersAndContributors,
  },
} as const satisfies QueryConfig<'action'>;
