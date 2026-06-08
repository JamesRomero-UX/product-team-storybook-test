import type { QueryConfig } from '../db';
import { document } from './fragments/index';
import {
  ancestorContributors,
  ownersAndContributors,
  scheduleAndState,
  tagsAndDepartments,
} from './utils';

export const getDocumentListQueryConfig = {
  ...document,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ...scheduleAndState,
    parent: {
      with: {
        parent: {
          columns: {
            Id: true,
            Title: true,
            SequentialId: true,
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
        },
      },
    },
  },
} as const satisfies QueryConfig<'document'>;

export const getDocumentRegisterQueryConfig = {
  columns: {
    OrgKey: false,
  },
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ...scheduleAndState,
    documentFiles: {
      columns: {
        ReviewDate: true,
        NextReviewDate: true,
        Status: true,
        PublishedDate: true,
        CreatedAtTimestamp: true,
      },
      with: {
        changeRequests: {
          orderBy: { ChangeRequestStatus: 'asc', ModifiedAtTimestamp: 'desc' },
          columns: {
            ChangeRequestStatus: true,
            ModifiedAtTimestamp: true,
          },
        },
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
    },
  },
} as const satisfies QueryConfig<'document'>;

export const getDocumentByIdQueryConfig = {
  ...document,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ...scheduleAndState,
    ...ancestorContributors,
    linkedDocuments: {
      columns: {
        OrgKey: false,
      },
      with: {
        child: {
          columns: {
            OrgKey: false,
          },
        },
      },
    },
    documentFiles: {
      columns: {
        Id: true,
        Version: true,
        Status: true,
      },
    },
    attestationConfig: {
      columns: {
        OrgKey: false,
      },
      with: {
        groups: {
          columns: {
            OrgKey: false,
          },
          with: {
            group: {
              columns: {
                OrgKey: false,
              },
              with: {
                users: {
                  columns: {
                    OrgKey: false,
                  },
                  with: {
                    user: {
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
    },
  },
} as const satisfies QueryConfig<'document'>;

export const myDocumentsQueryConfig = {
  columns: {
    Id: true,
    Title: true,
    Purpose: true,
  },
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
  },
} as const satisfies QueryConfig<'document'>;

export const myDueDocumentsQueryConfig = myDocumentsQueryConfig;

export const getDocumentListSimpleQueryConfig = {
  columns: {
    Id: true,
    Title: true,
  },
} as const satisfies QueryConfig<'document'>;

export const getMyDueItemsDocumentQueryConfig = {
  columns: {
    Id: true,
    Title: true,
  },
  with: {
    ...ownersAndContributors,
    ...scheduleAndState,
  },
} as const satisfies QueryConfig<'document'>;
