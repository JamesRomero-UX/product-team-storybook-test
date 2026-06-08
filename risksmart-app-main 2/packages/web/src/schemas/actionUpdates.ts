import { z } from 'zod';

import { CustomAttributeDataSchema, FileOrRelationSchema } from './global';

export const ActionUpdatesSchema = z
  .object({
    Title: z.string().min(1, { message: 'Required' }),
    Description: z.string(),
    Id: z.string().uuid().optional(),
    ParentActionId: z.string().uuid(),
    files: z.array(FileOrRelationSchema),
  })
  .and(CustomAttributeDataSchema);

export type ActionUpdatesFields = z.infer<typeof ActionUpdatesSchema>;

export const defaultValues: ActionUpdatesFields = {
  Description: '',
  ParentActionId: '',
  Title: '',
  files: [],
  CustomAttributeData: null,
};
