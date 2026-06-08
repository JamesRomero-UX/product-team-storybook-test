import { AcceptanceStatusEnum } from 'generated/graphql';
import { CustomAttributeDataSchema, StringDateSchema } from 'src/sharedSchemas';
import { z } from 'zod';

export const PostSchema = z
  .object({
    ParentId: z.string().uuid(),
    Id: z.string().uuid().optional(),
    Status: z.nativeEnum(AcceptanceStatusEnum, {
      errorMap: () => ({ message: 'Required' }),
    }),
    DateAcceptedFrom: StringDateSchema,
    DateAcceptedTo: StringDateSchema,
    Details: z.string().nullish(),
    Title: z.string().min(1, { message: 'Required' }),
    ApprovedByUser: z.string().nullish(),
    ApprovedByUserGroup: z.string().nullish(),
    RequestedByUser: z.string().nullish(),
    RequestedByUserGroup: z.string().nullish(),
  })
  .and(CustomAttributeDataSchema);

export const PutSchema = z
  .object({
    Id: z.string().uuid(),
    DateAcceptedFrom: StringDateSchema,
    DateAcceptedTo: StringDateSchema,
    Details: z.string().nullish(),
    Status: z.nativeEnum(AcceptanceStatusEnum, {
      errorMap: () => ({ message: 'Required' }),
    }),
    Title: z.string().min(1, { message: 'Required' }),
    ApprovedByUser: z.string().nullish(),
    ApprovedByUserGroup: z.string().nullish(),
    RequestedByUser: z.string().nullish(),
    RequestedByUserGroup: z.string().nullish(),
  })
  .and(CustomAttributeDataSchema);

export const DeleteSchema = z.object({
  Ids: z.string().uuid().array().min(1),
});
