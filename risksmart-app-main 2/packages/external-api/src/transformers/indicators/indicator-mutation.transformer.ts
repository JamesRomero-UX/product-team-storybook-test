import { IndicatorType } from '@risksmart-app/domain/src/types/consts/indicator-type';

import type { UpdateIndicatorRequest } from '../../schemas/indicators/indicator-mutate-request.schema';
import {
  buildScheduleFields,
  type ScheduleDefaults,
} from '../../types/transform';

export interface IndicatorUpdateDefaults {
  Type: IndicatorType;
  Description: string | null;
  Unit: string | null;
  UpperToleranceNum: number | null;
  LowerToleranceNum: number | null;
  UpperAppetiteNum: number | null;
  LowerAppetiteNum: number | null;
  schedule: ScheduleDefaults | null | undefined;
}

export function mergeIndicatorUpdateDefaults(
  item: UpdateIndicatorRequest,
  existing: IndicatorUpdateDefaults
): UpdateIndicatorRequest {
  const scheduleOverride =
    item.schedule === undefined && existing.schedule != null
      ? { schedule: buildScheduleFields(existing.schedule) }
      : {};

  const descriptionOverride =
    item.description === undefined && existing.Description !== undefined
      ? { description: existing.Description }
      : {};

  if (existing.Type === IndicatorType.Number) {
    return {
      ...item,
      ...descriptionOverride,
      ...scheduleOverride,
      ...(item.unit === undefined && existing.Unit !== undefined
        ? { unit: existing.Unit }
        : {}),
      ...(item.upperTolerance === undefined &&
      existing.UpperToleranceNum !== undefined
        ? { upperTolerance: existing.UpperToleranceNum }
        : {}),
      ...(item.lowerTolerance === undefined &&
      existing.LowerToleranceNum !== undefined
        ? { lowerTolerance: existing.LowerToleranceNum }
        : {}),
      ...(item.upperAppetite === undefined &&
      existing.UpperAppetiteNum !== undefined
        ? { upperAppetite: existing.UpperAppetiteNum }
        : {}),
      ...(item.lowerAppetite === undefined &&
      existing.LowerAppetiteNum !== undefined
        ? { lowerAppetite: existing.LowerAppetiteNum }
        : {}),
    };
  }

  return {
    ...item,
    ...descriptionOverride,
    ...scheduleOverride,
  };
}
