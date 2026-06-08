import type { QueryConfig } from '../db';
import { file } from './fragments/index';
import { owners, tagsAndDepartments } from './utils';

export const getDocumentFileQueryConfig = {
  columns: {
    OrgKey: false,
  },
  with: {
    parent: {
      columns: {
        Id: true,
        Title: true,
      },
    },
  },
} as const satisfies QueryConfig<'document_file'>;

export const getDocumentFileByIdQueryConfig = {
  columns: {
    OrgKey: false,
  },
  with: {
    file: {
      ...file,
    },
    parent: {
      columns: {
        Id: true,
        Title: true,
      },
      with: {
        ...owners,
      },
    },
    // changeRequests fetched separately using selectDistinctOn for distinct_on behavior
  },
} as const satisfies QueryConfig<'document_file'>;

export const getDocumentFilesByDocumentIdQueryConfig = {
  columns: {
    OrgKey: false,
  },
  with: {
    file: {
      ...file,
    },
    reviewedBy: {
      columns: {
        FriendlyName: true,
      },
    },
    // changeRequests fetched separately using selectDistinctOn for distinct_on behavior
  },
} as const satisfies QueryConfig<'document_file'>;

export const getPublicDocumentFilesQueryConfig = {
  columns: {
    OrgKey: false,
  },
  with: {
    file: {
      ...file,
    },
    reviewedBy: {
      columns: {
        FriendlyName: true,
      },
    },
    parent: {
      columns: {
        Id: true,
        Title: true,
        DocumentType: true,
      },
      with: {
        ...owners,
        ...tagsAndDepartments,
      },
    },
    // attestations fetched separately with userId filtering and limit 1
  },
} as const satisfies QueryConfig<'document_file'>;

export const getLatestDocumentFileQueryConfig = {
  columns: {
    Id: true,
    Version: true,
    Status: true,
    Content: true,
    Type: true,
    Link: true,
    FileId: true,
    CustomAttributeData: true,
    PublishedDate: true,
    OrgKey: false,
  },
  with: {
    file: {
      columns: {
        FileName: true,
        OrgKey: false,
      },
    } as const satisfies QueryConfig<'file'>,
    parent: {
      columns: {
        Title: true,
        OrgKey: false,
      },
      with: {
        ...owners,
        ...tagsAndDepartments,
        linkedDocuments: {
          columns: {
            OrgKey: false,
          },
          with: {
            child: {
              columns: {
                Id: true,
                Title: true,
                OrgKey: false,
              },
            } as const satisfies QueryConfig<'document'>,
          },
        } as const satisfies QueryConfig<'document_linked_document'>,
      },
    } as const satisfies QueryConfig<'document'>,
  },
} as const satisfies QueryConfig<'document_file'>;
