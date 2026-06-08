import {
  ContributorsSchema,
  CustomAttributeDataSchema,
  OwnersSchema,
  StringDateSchema,
  TagsAndDepartmentsSchema,
} from 'src/sharedSchemas';
import { z } from 'zod';

const requiredMessage = 'Required';

export const BaseInternalAuditSchema = z
  .object({
    Title: z.string().min(1, requiredMessage),
    Description: z.string().nullable(),
    BusinessArea: z.string().min(1, requiredMessage),
  })
  .extend(ContributorsSchema)
  .extend(OwnersSchema)
  .extend(TagsAndDepartmentsSchema)
  .and(CustomAttributeDataSchema);

export const InternalAuditPostSchema = z.object({
  Input: BaseInternalAuditSchema,
});

export const InternalAuditPutSchema = z.object({
  Input: BaseInternalAuditSchema.and(
    z.object({
      OriginalTimestamp: StringDateSchema,
      Id: z.string().uuid(),
      BusinessAreaId: z.string().uuid(),
    })
  ),
});
