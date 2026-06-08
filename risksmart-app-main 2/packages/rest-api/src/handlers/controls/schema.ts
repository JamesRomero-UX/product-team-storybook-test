import { ControlTypeEnum } from 'generated/graphql';
import {
  ContributorsSchema,
  CustomAttributeDataSchema,
  OwnersSchema,
  ScheduleSchema,
  StringDateSchema,
  TagsAndDepartmentsSchema,
} from 'src/sharedSchemas';
import { z } from 'zod';

const requiredMessage = 'Required';

const SharedSchema = z
  .object({
    Type: z.nativeEnum(ControlTypeEnum).nullable(),
    Title: z.string().min(1, { message: requiredMessage }),
    Description: z.string().nullable(),
  })
  .extend(ContributorsSchema)
  .extend(OwnersSchema)
  .extend(TagsAndDepartmentsSchema)
  .and(CustomAttributeDataSchema)
  .and(ScheduleSchema);

export const PostSchema = z.object({
  object: z
    .object({
      ParentId: z.string().uuid(),
    })
    .and(SharedSchema),
});

export const DeleteSchema = z.object({
  Ids: z.string().uuid().array().min(1),
});

export const PutSchema = z.object({
  object: z
    .object({
      Id: z.string().uuid(),
      OriginalTimestamp: StringDateSchema,
    })
    .and(SharedSchema),
});
