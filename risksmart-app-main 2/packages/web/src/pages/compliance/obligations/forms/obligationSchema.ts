import { Obligation_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  defaultSchedule,
  ScheduleSchema,
} from 'src/pages/controls/update/forms/scheduleSchema';
import {
  CustomAttributeDataSchema,
  InheritedContributorSchema,
  NullableStringDateSchema,
  TagsAndDepartmentsSchema,
  UserOrGroupsSchema,
} from 'src/schemas/global';
import { z } from 'zod';

const message = 'Required';

const checkForRequiredParentId = (
  {
    type,
    parentId,
  }: { type: Obligation_Type_Enum; parentId: null | string | undefined },
  ctx: z.RefinementCtx
) => {
  if (type !== Obligation_Type_Enum.Standard && !parentId) {
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
  }: { type: Obligation_Type_Enum; description: null | string | undefined },
  ctx: z.RefinementCtx
) => {
  if (type === Obligation_Type_Enum.Rule && !description) {
    ctx.addIssue({
      message,
      code: z.ZodIssueCode.custom,
      path: ['Description'],
    });
  }
};

const defaultSchema = z
  .object({
    Title: z.string().min(1, { message }),
    Description: z.string(),
    Type: z.nativeEnum(Obligation_Type_Enum),
    ParentId: z.string().uuid().nullish(),
    Adherence: z.string().min(1, { message }),
    Interpretation: z.string().nullish(),
    Contributors: UserOrGroupsSchema,
    Owners: UserOrGroupsSchema.min(1, { message }),
    NextTestDate: NullableStringDateSchema,
    TagTypeIds: z.array(z.string()),
    DepartmentTypeIds: z.array(z.string()),
    ancestorContributors: InheritedContributorSchema,
  })
  .and(ScheduleSchema)
  .and(CustomAttributeDataSchema);

export const ObligationSchema = defaultSchema
  .superRefine((values, ctx) => {
    checkForRequiredParentId(
      { type: values.Type, parentId: values.ParentId },
      ctx
    );
    checkForRequiredDescription(
      { type: values.Type, description: values.Description },
      ctx
    );
  })
  .and(TagsAndDepartmentsSchema);

export type ObligationFormFieldData = z.infer<typeof ObligationSchema>;

export const defaultValues: ObligationFormFieldData = {
  Title: '',
  Description: '',
  Type: Obligation_Type_Enum.Standard,
  ParentId: null,
  Adherence: '',
  Interpretation: '',
  Owners: [],
  TagTypeIds: [],
  DepartmentTypeIds: [],
  CustomAttributeData: null,
  Contributors: [],
  ancestorContributors: [],
  tags: [],
  departments: [],
  schedule: defaultSchedule,
};
