import { FileOrRelationSchema } from 'src/schemas/global';
import { z } from 'zod';

import { supportedCsvFiles } from '../csvFiles';

export const DataImportSchema = z
  .object({
    files: z.array(FileOrRelationSchema),
  })
  .superRefine((data, ctx) => {
    for (const file of data.files.filter((f) => f instanceof File)) {
      if (!supportedCsvFiles.includes(file.name)) {
        ctx.addIssue({
          message: `The file "${file.name}" is not supported. Must be one of ${supportedCsvFiles.join(', ')}`,
          path: ['global'],
          code: 'custom',
        });
      }
    }
    if (data.files.length == 0) {
      ctx.addIssue({
        message: 'At least one csv file is required',
        path: ['files'],
        code: 'custom',
      });
    }
  });
export type DataImportDataFields = z.infer<typeof DataImportSchema>;

export const defaultValues: DataImportDataFields = {
  files: [],
};
