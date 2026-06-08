import { z } from 'zod';

export const upsertScheduleStateRequestSchema = z.object({
  LatestDate: z.string().nullable().optional(),
  DueDate: z.string().nullable().optional(),
  OverdueDate: z.string().nullable().optional(),
});

export type UpsertScheduleStateRequest = z.infer<
  typeof upsertScheduleStateRequestSchema
>;
