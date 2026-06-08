import type { SchedulePartsFragment } from 'generated/graphql';

import type { DeepNullable } from './utils';

type Schedule =
  | DeepNullable<Partial<Omit<SchedulePartsFragment, 'Id'>>>
  | undefined
  | null;

export const isEqual = (current: Schedule, incoming: Schedule) => {
  return (
    current?.Frequency === incoming?.Frequency &&
    current?.ManualDueDate === incoming?.ManualDueDate &&
    current?.StartDate === incoming?.StartDate &&
    current?.TimeToCompleteUnit === incoming?.TimeToCompleteUnit &&
    current?.TimeToCompleteValue === incoming?.TimeToCompleteValue
  );
};
