import type { QueryConfig } from '../db';
import {
  acceptance,
  ancestorContributor,
  file,
  relationFile,
} from './fragments/index';
import { ownersAndContributors, tagsAndDepartments } from './utils';

export const getAcceptanceRegisterQueryConfig = {
  ...acceptance,
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
    requestedByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    requestedByUserGroup: {
      columns: {
        Name: true,
      },
    },
    approvedByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    approvedByUserGroup: {
      columns: {
        Name: true,
      },
    },
    parents: {
      columns: {
        Id: true,
      },
      with: {
        risk: {
          columns: {
            Id: true,
            Tier: true,
            Title: true,
          },
          with: {
            ...ownersAndContributors,
            ...tagsAndDepartments,
          },
        },
      },
    },
    files: {
      ...relationFile,
      with: {
        file: {
          ...file,
        },
      },
    },
  },
} as const satisfies QueryConfig<'acceptance'>;

export const getAcceptanceListQueryConfig = {
  ...acceptance,
  with: {
    parents: {
      columns: {
        Id: true,
      },
      with: {
        parent: {
          columns: {
            Id: true,
            ObjectType: true,
            SequentialId: true,
          },
        },
        risk: {
          columns: {
            Id: true,
            Title: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'acceptance'>;

export const getAcceptanceByIdQueryConfig = {
  ...acceptance,
  with: {
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
    files: {
      ...relationFile,
      with: {
        file: {
          ...file,
        },
      },
    },
    parents: {
      columns: {
        Id: true,
      },
      with: {
        parent: {
          columns: {
            Id: true,
            ObjectType: true,
            SequentialId: true,
          },
        },
        risk: {
          columns: {
            Id: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'acceptance'>;

export const getAcceptancesByParentRiskIdQueryConfig = {
  ...acceptance,
  with: {
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
    requestedByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    requestedByUserGroup: {
      columns: {
        Name: true,
      },
    },
    approvedByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    approvedByUserGroup: {
      columns: {
        Name: true,
      },
    },
    parents: {
      columns: { Id: true },
      with: {
        risk: {
          columns: {
            Id: true,
            Tier: true,
            Title: true,
          },
          with: {
            ...ownersAndContributors,
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
            ...tagsAndDepartments,
          },
        },
      },
    },
    files: {
      ...relationFile,
      with: {
        file: {
          ...file,
        },
      },
    },
  },
} as const satisfies QueryConfig<'acceptance'>;
