import type { UpdateIndicatorResultRequest } from '../../schemas/indicators/indicator-result-mutate-request.schema';

export interface IndicatorResultUpdateDefaults {
  Description: string | null;
  TargetValueNum: number | null;
  TargetValueTxt: string | null;
}

export function mergeIndicatorResultUpdateDefaults(
  item: UpdateIndicatorResultRequest,
  existing: IndicatorResultUpdateDefaults
): UpdateIndicatorResultRequest {
  return {
    ...item,
    ...(item.description === undefined && existing.Description !== undefined
      ? { description: existing.Description }
      : {}),
    ...(item.targetValueNum === undefined &&
    existing.TargetValueNum !== undefined
      ? { targetValueNum: existing.TargetValueNum }
      : {}),
    ...(item.targetValueTxt === undefined &&
    existing.TargetValueTxt !== undefined
      ? { targetValueTxt: existing.TargetValueTxt }
      : {}),
  };
}
