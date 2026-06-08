import type { QueryConfig } from '../db';
import { entity } from './fragments/index';
import { owners } from './utils';

export const getEntitiesQueryConfig = {
  columns: {
    Id: true,
  },
  with: {
    ...owners,
    descendants: {
      columns: {
        Id: true,
      },
      with: {
        ...owners,
        descendants: {
          columns: {
            Id: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'entity'>;

export const getEntityRegisterQueryConfig = {
  ...entity,
  with: {
    ...owners,
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
    children: {
      columns: {
        Id: true,
        Name: true,
      },
    },
    parent: {
      columns: {
        Id: true,
        Name: true,
      },
    },
  },
} as const satisfies QueryConfig<'entity'>;

export const getEntityByIdQueryConfig = {
  ...entity,
  with: {
    ...owners,
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
    parent: {
      columns: {
        Id: true,
        Name: true,
      },
    },
  },
} as const satisfies QueryConfig<'entity'>;
