import type { QueryConfig } from '../db';

export const getAttestationCycleQueryConfig = {
  columns: {
    OrgKey: false,
  },
  with: {
    attestation_record: {
      columns: {
        ExpiresAt: true,
        AttestationStatus: true,
        UserId: true,
      },
    },
    document_file: {
      columns: {
        Version: true,
        Id: true,
      },
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
} as const satisfies QueryConfig<'attestation_cycle'>;
