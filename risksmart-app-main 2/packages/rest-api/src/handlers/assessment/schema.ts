import { AssessmentStatusEnum } from 'generated/graphql';
import {
  ContributorsSchema,
  CustomAttributeDataSchema,
  OwnersSchema,
  StringDateSchema,
  TagsAndDepartmentsSchema,
} from 'src/sharedSchemas';
import { z } from 'zod';

const BaseSchema = z
  .object({
    OriginatingItemId: z.string().nullable(),
    Title: z.string().min(1, { message: 'Required' }),
    Summary: z.string().nullable(),
    ActualCompletionDate: StringDateSchema.nullable(),
    NextTestDate: StringDateSchema.nullable(),
    StartDate: StringDateSchema.nullable(),
    TargetCompletionDate: StringDateSchema.nullable(),
    CompletedByUser: z.string().nullable(),
    Status: z.nativeEnum(AssessmentStatusEnum),
    Outcome: z.number().nullable(),
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
