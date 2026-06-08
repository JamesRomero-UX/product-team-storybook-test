import type { QueryConfig } from '../db';
import { indicator, indicatorResult } from './fragments/index';
import {
  ancestorContributors,
  owners,
  ownersAndContributors,
  relationFiles,
  scheduleAndState,
  tagsAndDepartments,
} from './utils';

export const getIndicatorListQueryConfig = {
  ...indicator,
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
        control: {
          columns: { Title: true },
        },
        risk: {
          columns: { Title: true },
        },
      },
    },
  },
} as const satisfies QueryConfig<'indicator'>;

export const getIndicatorByIdQueryConfig = {
  columns: {
    OrgKey: false,
  },
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ...ancestorContributors,
    ...relationFiles,
    ...scheduleAndState,
  },
} as const satisfies QueryConfig<'indicator'>;

// Config that is extended by interface and can't have fragment spread into it
export const getIndicatorRegisterQueryConfig = {
  columns: {
    OrgKey: false,
  },
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ...scheduleAndState,
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
        control: {
          columns: {
            Title: true,
          },
        },
        risk: {
          columns: {
            Title: true,
          },
        },
      },
    },
    results: {
      columns: {
        TargetValueNum: true,
        TargetValueTxt: true,
        ResultDate: true,
      },
      orderBy: (t, { desc }) => [desc(t.ResultDate)],
    },
  },
} as const satisfies QueryConfig<'indicator'>;

export const getIndicatorResultByIdQueryConfig = {
  ...indicatorResult,
  with: {
    modifiedBy: {
      columns: {
        FriendlyName: true,
      },
    },
    parent: {
      columns: {
        Type: true,
        Id: true,
      },
    },
  },
} as const satisfies QueryConfig<'indicator_result'>;

export const getIndicatorResultsByIndicatorIdQueryConfig = {
  columns: {
    Description: true,
    Id: true,
    ResultDate: true,
    TargetValueNum: true,
    TargetValueTxt: true,
    CustomAttributeData: true,
  },
  with: {
    modifiedBy: {
      columns: {
        FriendlyName: true,
      },
    },
    parent: {
      columns: {
        Type: true,
      },
    },
  },
} as const satisfies QueryConfig<'indicator_result'>;

export const getMyDueItemsIndicatorsQueryConfig = {
  columns: {
    Id: true,
    Title: true,
  },
  with: {
    ...ownersAndContributors,
    ...scheduleAndState,
  },
} as const satisfies QueryConfig<'indicator'>;

export const myDueIndicatorsQueryConfig = getMyDueItemsIndicatorsQueryConfig;

export const myIndicatorsQueryConfig = {
  columns: {
    Id: true,
    Title: true,
    Description: true,
  },
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
  },
} as const satisfies QueryConfig<'indicator'>;

export const getIndicatorsByParentIdQueryConfig = {
  columns: {
    OrgKey: false,
  },
  with: {
    ...tagsAndDepartments,
    ...owners,
    modifiedBy: {
      columns: {
        FriendlyName: true,
      },
    },
    createdBy: {
      columns: {
        FriendlyName: true,
      },
    },
    results: {
      columns: {
        TargetValueNum: true,
        TargetValueTxt: true,
        ResultDate: true,
      },
      orderBy: (t, { desc }) => [desc(t.ResultDate)],
    },
    parents: {
      columns: {},
      with: {
        control: {
          columns: {
            Title: true,
          },
        },
        risk: {
          columns: {
            Title: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'indicator'>;
