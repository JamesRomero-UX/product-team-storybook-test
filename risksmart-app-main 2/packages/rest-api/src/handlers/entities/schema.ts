import { z } from 'zod';

const BaseSchema = z.object({
  Name: z.string().min(1, { message: 'Required' }),
  Description: z.string(),
  ParentId: z.string().uuid().nullish(),
  Weight: z.number().positive().default(1.0),
  owners: z.array(z.string()),
  ownerGroups: z.array(z.string()),
});

export const PostSchema = z.object({ object: BaseSchema });
export const PutSchema = z.object({
  object: BaseSchema.and(
    z.object({
      Id: z.string().uuid(),
    })
  ),
});

export const DeleteSchema = z.object({ Id: z.string().uuid() });
