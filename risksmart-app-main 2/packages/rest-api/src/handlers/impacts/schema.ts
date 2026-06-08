import { CustomAttributeDataSchema, OwnersSchema } from 'src/sharedSchemas';
import { z } from 'zod';

const requiredMessage = 'Required';
const BaseSchema = z
  .object({
    Name: z.string().min(1, requiredMessage),
    Rationale: z.string().nullable(),
    RatingGuidance: z.string().nullable(),
    LikelihoodAppetite: z.number().int().min(1).max(5).nullish(),
  })
  .extend(OwnersSchema)
  .and(CustomAttributeDataSchema);

export const PostSchema = z.object({
  object: BaseSchema,
});

export const PutSchema = z.object({
  object: BaseSchema.and(
    z.object({
      Id: z.string().min(1, requiredMessage),
    })
  ),
});
