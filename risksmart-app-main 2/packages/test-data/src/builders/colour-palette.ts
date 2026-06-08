import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildColourPalette = (
  orgKey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'colour_palette'>>
): InferInsertModel<'colour_palette'> => ({
  Id: randomUUID(),
  Name: 'Test Colour Palette',
  Settings: { colors: ['#FF0000', '#00FF00', '#0000FF'] },
  OrgKey: orgKey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  ...overrides,
});
