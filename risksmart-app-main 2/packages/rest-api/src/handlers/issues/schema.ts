import {
  ContributorsSchema,
  CustomAttributeDataSchema,
  OwnersSchema,
  StringDateSchema,
  TagsAndDepartmentsSchema,
} from 'src/sharedSchemas';
import { z } from 'zod';

const requiredMessage = 'Required';

const BaseSchema = z
  .object({
    Title: z.string().min(1, { message: requiredMessage }),
    Details: z.string().nullish(),
    ImpactsCustomer: z.boolean().nullish(),
    IsExternalIssue: z.boolean().nullish(),
    DateOccurred: StringDateSchema,
    DateIdentified: StringDateSchema,
    Meta: z.any().nullable(),
  })
  .extend(TagsAndDepartmentsSchema)
  .extend(ContributorsSchema)
  .extend(OwnersSchema)
  .and(CustomAttributeDataSchema);

export const PostSchema = z.object({
  object: BaseSchema.and(
    z.object({
      Type: z.string(),
      ParentId: z.string().uuid().nullish(),
    })
  ),
});

export const PutSchema = z.object({
  object: BaseSchema.and(
    z.object({
      Id: z.string().uuid(),
      OriginalTimestamp: StringDateSchema,
    })
  ),
});

export const DeleteSchema = z.object({
  Ids: z.string().uuid().array().min(1),
});
