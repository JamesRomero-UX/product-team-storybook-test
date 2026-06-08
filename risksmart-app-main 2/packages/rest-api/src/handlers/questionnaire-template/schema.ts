import {
  ContributorsSchema,
  CustomAttributeDataSchema,
  OwnersSchema,
  TagsAndDepartmentsSchema,
} from 'src/sharedSchemas';
import { z } from 'zod';

const BaseSchema = z
  .object({
    Title: z.string().min(1, 'Required'),
    Description: z.string().nullish(),
  })
  .extend(ContributorsSchema)
  .extend(OwnersSchema)
  .extend(TagsAndDepartmentsSchema)
  .and(CustomAttributeDataSchema);

export const PostSchema = z.object({ object: BaseSchema });

export const PutSchema = z.object({
  object: BaseSchema.and(
    z.object({
      Id: z.string().uuid(),
    })
  ),
});
