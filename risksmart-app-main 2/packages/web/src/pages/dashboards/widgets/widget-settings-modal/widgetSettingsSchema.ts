import type { z } from 'zod';

import {
  filterSchema,
  titleSchema,
} from '../../universal-widget/settingsSchema';

export const settingsSchema = filterSchema.and(titleSchema);

export type SettingsSchema = z.infer<typeof settingsSchema>;
