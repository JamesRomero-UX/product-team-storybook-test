import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getColourPalettesQueryConfig } from '@risksmart-app/drizzle/src/queries/colour-palette.query';

export type ColourPaletteResponseRow = InferQueryModel<
  'colour_palette',
  typeof getColourPalettesQueryConfig
>;
