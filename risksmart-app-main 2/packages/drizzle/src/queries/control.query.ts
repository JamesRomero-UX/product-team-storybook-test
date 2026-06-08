import {
  ParentTypes,
  RATING_TYPE_ASSESSMENT,
} from '@risksmart-app/domain/src/types/consts/index';

import type { QueryConfig } from '../db';
import { control } from './fragments/index';
import {
  ownersAndContributors,
  scheduleAndState,
  tagsAndDepartments,
} from './utils';

// Config that is extended by interface and can't have fragment spread into it
export const getControlRegisterQueryConfig = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    scheduleState: {
      columns: {
        LatestDate: true,
        DueDate: true,
        OverdueDate: true,
      },
    },
    actions: {
      columns: {
        ActionId: true,
      },
    },
    issues: {
      columns: {
        IssueId: true,
      },
      with: {
        issue: {
          columns: { Id: true },
          with: {
            assessment: {
              columns: {
                Status: true,
              },
            },
          },
        },
      },
    },
    indicators: {
      columns: {
        IndicatorId: true,
      },
    },
    testResults: {
      where: {
        RatingType: {
          in: RATING_TYPE_ASSESSMENT,
        },
      },
      columns: {
        Id: true,
        OverallEffectiveness: true,
        DesignEffectiveness: true,
        PerformanceEffectiveness: true,
        TestDate: true,
      },
      orderBy: {
        TestDate: 'desc',
        ModifiedAtTimestamp: 'desc',
      },
    },
    parents: {
      columns: { ParentId: true },
      with: {
        parent: {
          columns: {
            Id: true,
            ObjectType: true,
            SequentialId: true,
          },
        },
        obligation: {
          columns: {
            Title: true,
          },
        },
        risk: {
          columns: {
            Title: true,
          },
        },
        thirdParty: {
          columns: {
            Title: true,
          },
        },
        group: {
          columns: {
            Id: true,
            Title: true,
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
} as const satisfies QueryConfig<'control'>;

export const getControlListQueryConfig = {
  ...control,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    parents: {
      columns: { ParentId: true },
      with: {
        parent: {
          columns: {
            Id: true,
            ObjectType: true,
            SequentialId: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'control'>;

export const getControlByIdQueryConfig = {
  ...control,
  with: {
    ...scheduleAndState,
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ancestorContributors: {
      columns: {
        OrgKey: false,
      },
      with: {
        user: {
          columns: {
            Id: true,
            FriendlyName: true,
          },
        },
        user_group: {
          columns: {
            Id: true,
            Name: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'control'>;

export const getControlsByUserIdQueryConfig = {
  ...control,
} as const satisfies QueryConfig<'control'>;

export const myControlsQueryConfig = {
  columns: {
    Id: true,
    Title: true,
    Description: true,
  },
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
  },
} as const satisfies QueryConfig<'control'>;

export const getControlsBasicQueryConfig = {
  columns: {
    Id: true,
    Title: true,
    SequentialId: true,
  },
} as const satisfies QueryConfig<'control'>;

export const getControlNodesQueryConfig = {
  columns: {
    Id: true,
    SequentialId: true,
  },
  where: { ObjectType: ParentTypes.Control },
} as const satisfies QueryConfig<'node'>;

export const myDueControlsQueryConfig = myControlsQueryConfig;

export const getMyDueItemsControlsQueryConfig = {
  columns: {
    Id: true,
    Title: true,
  },
  with: {
    ...ownersAndContributors,
    ...scheduleAndState,
  },
} as const satisfies QueryConfig<'control'>;
