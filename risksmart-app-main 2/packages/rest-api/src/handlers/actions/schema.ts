import { ActionStatusEnum } from 'generated/graphql';
import {
  ContributorsSchema,
  CustomAttributeDataSchema,
  NullableStringDateSchema,
  OwnersSchema,
  StringDateSchema,
  TagsAndDepartmentsSchema,
} from 'src/sharedSchemas';
import { z } from 'zod';

const requiredMessage = 'Required';

export const PostSchema = z
  .object({
    ParentId: z.string().uuid().nullish(),
    DateDue: StringDateSchema,
    Title: z.string().min(1, { message: requiredMessage }),
    Status: z.nativeEnum(ActionStatusEnum),
    Priority: z
      .number()
      .int()
      .min(1, { message: requiredMessage })
      .max(3, { message: requiredMessage })
      .nullish(),
    Description: z.string().nullish(),
    DateRaised: StringDateSchema,
    ClosedDate: NullableStringDateSchema,
  })
  .extend(ContributorsSchema)
  .extend(OwnersSchema)
  .extend(TagsAndDepartmentsSchema)
  .and(CustomAttributeDataSchema)
  .superRefine((values, ctx) => {
    if (values.Status === ActionStatusEnum.Closed && !values.ClosedDate) {
      ctx.addIssue({
        path: ['ClosedDate'],
        code: 'invalid_date',
        message: 'Required',
      });
    }
  });

export const PutSchema = z
  .object({
    Id: z.string().uuid(),
    DateDue: StringDateSchema,
    Title: z.string().min(1, { message: requiredMessage }),
    Status: z.nativeEnum(ActionStatusEnum),
    Priority: z
      .number()
      .int()
      .min(1, { message: requiredMessage })
      .max(3, { message: requiredMessage })
      .nullish(),
    Description: z.string().nullish(),
    DateRaised: StringDateSchema,
    ClosedDate: NullableStringDateSchema,
    OriginalTimestamp: StringDateSchema,
  })
  .extend(ContributorsSchema)
  .extend(OwnersSchema)
  .extend(TagsAndDepartmentsSchema)
  .and(CustomAttributeDataSchema)
  .superRefine((values, ctx) => {
    if (values.Status === ActionStatusEnum.Closed && !values.ClosedDate) {
      ctx.addIssue({
        path: ['ClosedDate'],
        code: 'invalid_date',
        message: 'Required',
      });
    }
  });

export const DeleteSchema = z.object({
  Ids: z.array(z.string().uuid()),
});
