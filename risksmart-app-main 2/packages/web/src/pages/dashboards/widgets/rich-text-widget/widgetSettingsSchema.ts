import { z } from 'zod';

export const widgetSettingsSchema = z.object({
  content: z.string().min(0, 'Required'),
  allowOwnershipFiltering: z.boolean().optional(),
});

export type WidgetSettings = z.infer<typeof widgetSettingsSchema>;
