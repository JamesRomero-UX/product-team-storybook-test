import {
  Test_Frequency_Enum,
  Unit_Of_Time_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { NullableStringDateSchema } from 'src/schemas/global';
import { z } from 'zod';

const scheduleSchema = z.object({
  StartDate: NullableStringDateSchema,
  ManualDueDate: NullableStringDateSchema.nullish(),
  Frequency: z.nativeEnum(Test_Frequency_Enum).nullish(),
  TimeToCompleteValue: z.number().int().min(1).nullish(),
  TimeToCompleteUnit: z.nativeEnum(Unit_Of_Time_Enum).nullish(),
});

type Schedule = z.infer<typeof scheduleSchema>;

export const ScheduleSchema = z.object({
  schedule: scheduleSchema,
});

export const defaultSchedule: Schedule = {
  Frequency: null,
  ManualDueDate: null,
  StartDate: null,
  TimeToCompleteUnit: 'day',
  TimeToCompleteValue: 1,
};
