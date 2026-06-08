import { z } from 'zod';

import { CustomAttributeDataSchema, FileOrRelationSchema } from './global';

export const IssueUpdatesSchema = z
  .object({
    Title: z.coerce.string().min(1, { message: 'Required' }),
    Description: z.coerce.string(),
    files: z.array(FileOrRelationSchema),
  })
  .and(CustomAttributeDataSchema);

export type IssueUpdatesFields = z.infer<typeof IssueUpdatesSchema>;

export const defaultValues: IssueUpdatesFields = {
  Description: '',
  Title: '',
  files: [],
  CustomAttributeData: null,
};
