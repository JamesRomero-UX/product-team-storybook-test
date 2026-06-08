import type { QueryConfig } from '../../db';

export const relationFile = {
  columns: {
    ParentId: true,
    ChangeRequestFileOperation: true,
  },
} as const satisfies QueryConfig<'relation_file'>;
