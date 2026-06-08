import { Indicator_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import {
  defaultSchedule,
  ScheduleSchema,
} from 'src/pages/controls/update/forms/scheduleSchema';
import {
  CustomAttributeDataSchema,
  FileOrRelationSchema,
  InheritedContributorSchema,
  TagsAndDepartmentsSchema,
  UserOrGroupsSchema,
} from 'src/schemas/global';
import { z } from 'zod';

const message = 'Required';

const checkForRequiredToleranceRange = (
  value: IndicatorFormDataFields,
  ctx: z.RefinementCtx
) => {
  if (value.Type === Indicator_Type_Enum.Number) {
    const limits = [
      value.LowerToleranceNum,
      value.LowerAppetiteNum,
      value.UpperAppetiteNum,
      value.UpperToleranceNum,
    ];
    const limitsWithValue = limits.filter((l) => !_.isNil(l));

    const outOfSequence = limitsWithValue.find(
      (l, i) => i !== 0 && l < limitsWithValue[i - 1]
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

const numberFields = z.object({
  Type: z.literal(Indicator_Type_Enum.Number),
  UpperToleranceNum: z.number().nullish(),
  LowerToleranceNum: z.number().nullish(),
  UpperAppetiteNum: z.number().nullish(),
  LowerAppetiteNum: z.number().nullish(),
});

const textFields = z.object({
  Type: z.literal(Indicator_Type_Enum.Text),
  TargetValueTxt: z.string().min(1, { message }),
});

const boolFields = z.object({
  Type: z.literal(Indicator_Type_Enum.Boolean),
});

const typeFields = z.discriminatedUnion('Type', [
  numberFields,
  textFields,
  boolFields,
]);

export const indicatorSchema = z
  .object({
    Title: z.string({ invalid_type_error: message }).min(1, { message }),
    Description: z.string().nullish(),
    Type: z.nativeEnum(Indicator_Type_Enum, { invalid_type_error: message }),
    Unit: z.string().nullish(),

    Contributors: UserOrGroupsSchema,
    Owners: UserOrGroupsSchema.min(1, { message: message }),
    ancestorContributors: InheritedContributorSchema,
    files: z.array(FileOrRelationSchema),
  })
  .and(ScheduleSchema)
  .and(typeFields)
  .and(TagsAndDepartmentsSchema)
  .and(CustomAttributeDataSchema)

  .superRefine((values, ctx) => {
    checkForRequiredToleranceRange(values, ctx);
  });

export type IndicatorFormDataFields = z.infer<typeof indicatorSchema>;

export const defaultValues: IndicatorFormDataFields = {
  Title: '',
  Description: '',
  Type: Indicator_Type_Enum.Number,
  Unit: '',
  UpperToleranceNum: null,
  LowerToleranceNum: null,
  UpperAppetiteNum: null,
  LowerAppetiteNum: null,
  tags: [],
  departments: [],
  CustomAttributeData: null,
  Owners: [],
  Contributors: [],
  ancestorContributors: [],
  files: [],
  schedule: defaultSchedule,
};
