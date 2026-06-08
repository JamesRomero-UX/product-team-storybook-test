import { z } from 'zod';

export const AddControlSchema = z.object({
  ControlIds: z
    .array(
      z.object({
        value: z.string().uuid(),
      })
    )
    .min(1, { message: 'Required' }),
});

export type AddControlFields = z.infer<typeof AddControlSchema>;

export const defaultValues: AddControlFields = {
  ControlIds: [],
};
