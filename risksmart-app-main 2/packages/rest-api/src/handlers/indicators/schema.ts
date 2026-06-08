import { IndicatorTypeEnum } from 'generated/graphql';
import _ from 'lodash';
import {
  ContributorsSchema,
  CustomAttributeDataSchema,
  OwnersSchema,
  ScheduleSchema,
  TagsAndDepartmentsSchema,
} from 'src/sharedSchemas';
import { z } from 'zod';

const message = 'Required';

const numberFields = z.object({
  Type: z.literal(IndicatorTypeEnum.Number),
  UpperToleranceNum: z.number().nullish(),
  LowerToleranceNum: z.number().nullish(),
  UpperAppetiteNum: z.number().nullish(),
  LowerAppetiteNum: z.number().nullish(),
});

const textFields = z.object({
  Type: z.literal(IndicatorTypeEnum.Text),
  TargetValueTxt: z.string().min(1, { message }),
});

const boolFields = z.object({
  Type: z.literal(IndicatorTypeEnum.Boolean),
});

const typeFields = z.discriminatedUnion('Type', [
  numberFields,
  textFields,
  boolFields,
]);

const checkForRequiredToleranceRange = (
  value: BaseFormDataFields,
  ctx: z.RefinementCtx
) => {
  if (value.Type === IndicatorTypeEnum.Number) {
    const limits = [
      value.LowerToleranceNum,
      value.LowerAppetiteNum,
      value.UpperAppetiteNum,
      value.UpperToleranceNum,
    ];
    const limitsWithValue = limits.filter((l) => !_.isNil(l));

    const outOfSequence = limitsWithValue.find(
      (l, i) => i !== 0 && l < (limitsWithValue[i - 1] as number)
    );
    if (outOfSequence) {
      ctx.addIssue({
        message: 'Tolerances/appetites are out of sequence',
        code: z.ZodIssueCode.custom,
        path: ['LowerToleranceNum'],
      });
    }
  }
};

const BaseSchema = z
  .object({
    Title: z.string({ invalid_type_error: message }).min(1, { message }),
    Description: z.string().nullable(),
    Type: z.nativeEnum(IndicatorTypeEnum, { invalid_type_error: message }),
    Unit: z.string().nullable(),
  })
  .extend(ContributorsSchema)
  .extend(OwnersSchema)
  .extend(TagsAndDepartmentsSchema)
  .and(typeFields)
  .and(CustomAttributeDataSchema)
  .and(ScheduleSchema)
  .superRefine((values, ctx) => {
    checkForRequiredToleranceRange(values, ctx);
  });

export const PostSchema = z.object({
  object: BaseSchema.and(
    z.object({
      ParentId: z.string().uuid(),
    })
  ),
});
export const PutSchema = z.object({
  object: BaseSchema.and(
    z.object({
      Id: z.string().uuid(),
    })
  ),
});

export type BaseFormDataFields = z.infer<typeof BaseSchema>;

export type IndicatorFormDataFields = z.infer<typeof PostSchema>;
