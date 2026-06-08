import type { QueryConfig } from '../db';

export const getAttestationRecordQueryConfig = {
  columns: {
    OrgKey: false,
  },
  with: {
    user: {
      columns: {
        Id: true,
        FirstName: true,
        LastName: true,
        FriendlyName: true,
        Email: true,
        Department: true,
      },
    },
    carriedForwardFromRecord: {
      with: {
        node: {
          columns: {
            Id: true,
          },
          with: {
            documentFile: {
              columns: {
                Id: true,
                Version: true,
              },
            },
          },
        },
      },
    },
    node: {
      columns: {
        Id: true,
      },
      with: {
        documentFile: {
          columns: {
            Id: true,
            Version: true,
          },
          with: {
            parent: {
              columns: {
                Id: true,
                Title: true,
              },
              with: {
                owners: {
                  columns: {
                    OrgKey: false,
                  },
                },
                ownerGroups: {
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
} as const satisfies QueryConfig<'attestation_record'>;

export const getAttestationStatusQueryConfig = {
  columns: {
    OrgKey: false,
  },
  with: {
    config: {
      columns: {
        PromptText: true,
      },
    },
  },
} as const satisfies QueryConfig<'attestation_record'>;

export const myDueAttestationRecordsQueryConfig = {
  columns: { ExpiresAt: true, AttestationStatus: true },
  with: {
    node: {
      columns: {},
      with: {
        documentFile: {
          columns: {},
          with: {
            parent: {
              columns: {
                Id: true,
                Title: true,
              },
            },
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'attestation_record'>;

export const getMyDueItemsAttestationRecordsQueryConfig =
  myDueAttestationRecordsQueryConfig;
