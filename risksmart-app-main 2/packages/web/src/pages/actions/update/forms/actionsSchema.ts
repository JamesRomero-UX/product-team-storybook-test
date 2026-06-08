import { Action_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { z } from 'zod';

import {
  CustomAttributeDataSchema,
  FileOrRelationSchema,
  InheritedContributorSchema,
  NullableStringDateSchema,
  StringDateSchema,
  TagsAndDepartmentsSchema,
  UserOrGroupsSchema,
} from '../../../../schemas/global';

const requiredMessage = 'Required';
export const ActionFormSchema = z
  .object({
    DateDue: StringDateSchema,
    Title: z.string().min(1, { message: requiredMessage }),
    Status: z.nativeEnum(Action_Status_Enum),
    Priority: z
      .number()
      .int()
      .min(1, { message: requiredMessage })
      .max(3, { message: requiredMessage })
      .nullish(),
    Contributors: UserOrGroupsSchema,
    Owners: UserOrGroupsSchema.min(1, { message: requiredMessage }),
    ancestorContributors: InheritedContributorSchema,
    Description: z.string().nullish(),
    DateRaised: StringDateSchema,
    ClosedDate: NullableStringDateSchema,
    files: z.array(FileOrRelationSchema),
  })
  .and(CustomAttributeDataSchema)
  .superRefine((values, ctx) => {
    if (values.Status === Action_Status_Enum.Closed && !values.ClosedDate) {
      ctx.addIssue({
        path: ['ClosedDate'],
        code: 'invalid_date',
        message: 'Required',
      });
    }
  })
  .and(TagsAndDepartmentsSchema);

export type ActionFormFieldData = z.infer<typeof ActionFormSchema>;

export const defaultValues: ActionFormFieldData = {
  DateDue: '',
  Title: '',
  Status: Action_Status_Enum.Open,
  Priority: null,
  Owners: [],
  Contributors: [],
  Description: '',
  DateRaised: '',
  files: [],
  ClosedDate: null,
  CustomAttributeData: null,
  ancestorContributors: [],
  tags: [],
  departments: [],
};
