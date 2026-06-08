import type { ZodSchema } from 'zod';

import type { CsvFile } from '../sheets';
import type { CsvLineErrorType } from '../utils/logging';

export const validateAgainstSchema = <T>(
  file: CsvFile,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  records: any[],
  schema: ZodSchema,
  customAttributeSchema: ZodSchema | undefined = undefined
): { records: T[]; errors: CsvLineErrorType[] } => {
  const results: T[] = [];
  const errors: CsvLineErrorType[] = [];
  for (const record of records) {
    const result = schema.safeParse(record);

    if (!result.success) {
      for (const error of result.error.errors) {
        errors.push({
          file,
          row: records.indexOf(record) + 2,
          message: `${error.path.join('.')} - ${error.message}`,
        });
      }
    } else {
      if (customAttributeSchema) {
        const customAttributeSchemaResult =
          customAttributeSchema.safeParse(record);

        if (customAttributeSchemaResult?.success) {
          result.data.CustomAttributeData = customAttributeSchemaResult.data;
        } else {
          for (const error of customAttributeSchemaResult.error.errors) {
            errors.push({
              file,
              row: records.indexOf(record) + 2,
              message: `${error.path.join('.')} - ${error.message}`,
            });
          }

          continue;
        }
      }

      results.push(result.data);
    }
  }

  return { records: results, errors };
};
