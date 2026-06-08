import { z } from 'zod';

const requiredMessage = 'Required';

export const PostSchema = z.object({
  UserName: z.string().nullable(),
  Email: z.string().email().min(1, { message: requiredMessage }),
});
