import type { QueryConfig } from '../../db';

export const control = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
} as const satisfies QueryConfig<'control'>;

export const controlGroup = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
} as const satisfies QueryConfig<'control_group'>;
