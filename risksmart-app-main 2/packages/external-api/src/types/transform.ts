import type { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import type { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';

import type { EntityResult, Result } from './service';

export type ListDataTransformFn<TIn, TOut> = (
  result: Result<TIn>,
  ctx: Readonly<{ basePath: string; linkId?: string; resourceName?: string }>
) => TOut;

export type DataEntityTransformFn<TIn, TOut> = (
  result: EntityResult<TIn>['data'],
  ctx: Readonly<{ basePath: string; linkId?: string }>
) => TOut;

export interface ScheduleDefaults {
  StartDate: string | null | undefined;
  ManualDueDate: string | null | undefined;
  Frequency: TestFrequency | null | undefined;
  TimeToCompleteValue: number | null | undefined;
  TimeToCompleteUnit: UnitOfTime | null | undefined;
}

export function buildScheduleFields(s: ScheduleDefaults) {
  return {
    startDate: s.StartDate ?? null,
    manualDueDate: s.ManualDueDate ?? null,
    frequency: s.Frequency ?? null,
    timeToCompleteValue: s.TimeToCompleteValue ?? null,
    timeToCompleteUnit: s.TimeToCompleteUnit ?? null,
  };
}
