import type { QueryConfig } from '../db';

export const getColourPalettesQueryConfig = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'colour_palette'>;
