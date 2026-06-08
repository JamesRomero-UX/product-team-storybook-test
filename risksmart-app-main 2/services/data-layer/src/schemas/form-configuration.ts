import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import { z } from 'zod';

/**
 * Transform a comma-separated string into an array of trimmed, non-empty strings
 */
const commaSeparatedArray = z
  .string()
  .transform((val) =>
    val
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  )
  .pipe(z.array(z.string()).min(1, 'At least one value is required'));

/**
 * Schema for validating form configuration query parameters
 */
export const formConfigurationQuerySchema = z.object({
  parentTypes: commaSeparatedArray
    .pipe(z.array(z.nativeEnum(ParentTypes)))
    .optional(),
});

export type FormConfigurationQueryParams = z.infer<
  typeof formConfigurationQuerySchema
>;
