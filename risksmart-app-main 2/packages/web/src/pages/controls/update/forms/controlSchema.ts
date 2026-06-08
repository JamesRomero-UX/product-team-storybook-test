import { Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  CustomAttributeDataSchema,
  InheritedContributorSchema,
  TagsAndDepartmentsSchema,
  UserOrGroupsSchema,
} from 'src/schemas/global';
import { z } from 'zod';

import { defaultSchedule, ScheduleSchema } from './scheduleSchema';

export const ControlFormSchema = z
  .object({
    Title: z.string().min(1, { message: 'Required' }),
    Type: z
      .nativeEnum(Control_Type_Enum, {
        required_error: 'Required',
        invalid_type_error: 'Required',
      })
      .nullable(),
    Description: z.string().nullable(),
    Contributors: UserOrGroupsSchema,
    ancestorContributors: InheritedContributorSchema,
    Owners: UserOrGroupsSchema.min(1, { message: 'Required' }),
  })
  .and(ScheduleSchema)
  .and(CustomAttributeDataSchema)
  .and(TagsAndDepartmentsSchema);

export type ControlFormFieldData = z.infer<typeof ControlFormSchema>;

export const defaultValues: ControlFormFieldData = {
  Title: '',
  Description: '',
  Type: null as unknown as Control_Type_Enum,
  tags: [],
  departments: [],
  Owners: [],
  ancestorContributors: [],
  Contributors: [],
  CustomAttributeData: null,
  schedule: defaultSchedule,
};
