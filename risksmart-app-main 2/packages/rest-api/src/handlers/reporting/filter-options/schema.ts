import { dataSourceTypeSchema } from '@risksmart-app/shared/reporting/schema';
import { z } from 'zod';

export const PostSchema = z.object({
  Input: z.object({
    dataSourceType: dataSourceTypeSchema,
    fieldId: z.string(),
    limit: z.number(),
    offset: z.number(),
    filteringText: z.string(),
  }),
});
