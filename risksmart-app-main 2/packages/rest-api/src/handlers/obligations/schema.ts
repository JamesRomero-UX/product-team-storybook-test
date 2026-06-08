import { ObligationTypeEnum } from 'generated/graphql';
import {
  ContributorsSchema,
  CustomAttributeDataSchema,
  OwnersSchema,
  ScheduleSchema,
  TagsAndDepartmentsSchema,
} from 'src/sharedSchemas';
import { z } from 'zod';

export const DeleteSchema = z.object({
  Id: z.string().uuid(),
});

const message = 'Required';

const checkForRequiredParentId = (
  {
    type,
    parentId,
  }: { type: ObligationTypeEnum; parentId: string | null | undefined },
  ctx: z.RefinementCtx
) => {
  if (type !== ObligationTypeEnum.Standard && !parentId) {
    ctx.addIssue({
      message,
      code: z.ZodIssueCode.custom,
      path: ['ParentId'],
    });
  }
};
const checkForRequiredDescription = (
  {
    type,
    description,
  }: { type: ObligationTypeEnum; description: string | null | undefined },
  ctx: z.RefinementCtx
) => {
  if (type === ObligationTypeEnum.Rule && !description) {
    ctx.addIssue({
      message,
      code: z.ZodIssueCode.custom,
      path: ['Description'],
    });
  }
};

const BaseObligationSchema = z
  .object({
    Title: z.string().min(1, { message }),
    Description: z.string(),
    Type: z.nativeEnum(ObligationTypeEnum),
    ParentId: z.string().uuid().nullish(),
    Adherence: z.string().min(1, { message }),
    Interpretation: z.string().nullish(),
  })

  .extend(ContributorsSchema)
  .extend(OwnersSchema)
  .extend(TagsAndDepartmentsSchema)
  .and(CustomAttributeDataSchema)
  .and(ScheduleSchema)
  .superRefine((values, ctx) => {
    checkForRequiredParentId(
      { type: values.Type, parentId: values.ParentId },
      ctx
    );
    checkForRequiredDescription(
      { type: values.Type, description: values.Description },
      ctx
    );
  });

export const PostSchema = z.object({ object: BaseObligationSchema });
export const PutSchema = z.object({
  object: BaseObligationSchema.and(
    z.object({
      Id: z.string().uuid(),
    })
  ),
});
