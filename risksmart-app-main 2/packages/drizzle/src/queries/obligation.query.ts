import { IssueAssessmentStatus } from '@risksmart-app/domain/src/types/consts/index';

import type { QueryConfig } from '../db';
import { ancestorContributor, obligation } from './fragments/index';
import {
  ownersAndContributors,
  scheduleAndState,
  tagsAndDepartments,
} from './utils';

export const getObligationListQueryConfig = {
  ...obligation,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    parent: {
      columns: {
        Id: true,
        Title: true,
      },
    },
  },
} as const satisfies QueryConfig<'obligation'>;

export const getObligationRegisterQueryConfig = {
  ...obligation,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ...scheduleAndState,
    actions: {
      columns: {
        ActionId: true,
      },
    },
    parent: {
      columns: {
        Id: true,
        Title: true,
      },
    },
    controls: {
      columns: {
        ControlId: true,
      },
    },
    issues: {
      where: {
        issue: {
          assessment: {
            Status: {
              in: [IssueAssessmentStatus.Open, IssueAssessmentStatus.Pending],
            },
            RegulatoryBreach: true,
          },
        },
      },
      columns: {
        IssueId: true,
      },
      with: {
        issue: {
          columns: {
            Id: true,
            Title: true,
          },
        },
      },
    },
    assessmentResults: {
      columns: {
        Id: true,
        ResultType: true,
        ParentType: true,
        ParentId: true,
      },
    },
    createdBy: {
      columns: {
        FriendlyName: true,
      },
    },
    modifiedBy: {
      columns: {
        FriendlyName: true,
      },
    },
  },
} as const satisfies QueryConfig<'obligation'>;

export const getObligationByIdQueryConfig = {
  ...obligation,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ...scheduleAndState,
    ancestorContributors: {
      ...ancestorContributor,
      with: {
        user: {
          columns: {
            FriendlyName: true,
          },
        },
        user_group: {
          columns: {
            Name: true,
          },
        },
      },
    },
    createdBy: {
      columns: {
        FriendlyName: true,
      },
    },
    modifiedBy: {
      columns: {
        FriendlyName: true,
      },
    },
    parent: {
      columns: {
        Id: true,
        Title: true,
      },
    },
    parentNode: {
      columns: {
        Id: true,
        ObjectType: true,
        SequentialId: true,
      },
    },
  },
} as const satisfies QueryConfig<'obligation'>;

export const getMyObligationsQueryConfig = {
  columns: {
    Id: true,
    Title: true,
    Description: true,
  },
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
  },
} as const satisfies QueryConfig<'obligation'>;

export const myDueObligationsQueryConfig = getMyObligationsQueryConfig;

export const getMyDueItemsObligationsQueryConfig = {
  columns: {
    Id: true,
    Title: true,
  },
  with: {
    ...ownersAndContributors,
    ...scheduleAndState,
  },
} as const satisfies QueryConfig<'obligation'>;
