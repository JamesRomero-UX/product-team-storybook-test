import { Dashboard_Sharing_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import dayjs from 'dayjs';
import { z } from 'zod';

import {
  TagsAndDepartmentsSchema,
  UserOrGroupsSchema,
} from '../../../schemas/global';

export const DashboardSchema = z.object({
  name: z.string({ required_error: '' }),
  description: z.string().optional(),
  sharing: z.nativeEnum(Dashboard_Sharing_Type_Enum),
  Contributors: UserOrGroupsSchema,
});

export type DashboardFormFieldData = z.infer<typeof DashboardSchema>;

export const defaultValues: DashboardFormFieldData = {
  name: `Dashboard-${dayjs().format('YYYY-MM-DD')}`,
  sharing: Dashboard_Sharing_Type_Enum.UserOnly,
  Contributors: [],
};

export const DashboardFilterSchema = z
  .object({
    dateRange: z
      .object({
        type: z.enum(['relative', 'absolute']),
        startDate: z.string().nullish(),
        endDate: z.string().nullish(),
        key: z.string().nullish(),
        amount: z.number().nullish(),
        unit: z
          .enum(['second', 'minute', 'hour', 'day', 'week', 'month', 'year'])
          .nullish()
          .optional(),
      })
      .nullish(),
  })
  .and(TagsAndDepartmentsSchema);

export type DashboardFilterFieldData = z.infer<typeof DashboardFilterSchema>;
