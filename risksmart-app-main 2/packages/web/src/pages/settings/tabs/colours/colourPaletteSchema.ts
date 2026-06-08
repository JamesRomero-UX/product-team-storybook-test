import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';

export const colourPaletteSchema = z.object({
  colours: z
    .array(
      z
        .string()
        .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, 'Must be a valid hex code')
    )
    .min(1, 'At least one colour is required')
    .max(16, 'A maximum of 16 colours are allowed'),
});

export type ColourPaletteFormData = z.infer<typeof colourPaletteSchema>;

export const defaultValues: DefaultValues<ColourPaletteFormData> = {
  colours: [],
};
