import type { QueryConfig } from '../db';
import { obligation_change } from './fragments/index';
import { ownersAndContributors } from './utils';

export const getObligationChangeRegisterQueryConfig = {
  ...obligation_change,
  with: {
    ...ownersAndContributors,
    obligation: {
      columns: {
        Id: true,
        Title: true,
        Description: true,
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
    attestations: {
      columns: {
        UserId: true,
      },
    },
    actions: {
      with: {
        action: {
          columns: {
            Id: true,
            Title: true,
            SequentialId: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'obligation_change'>;
