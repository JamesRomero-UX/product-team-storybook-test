import type { RiskStatusType } from '@risksmart-app/domain/src/types/consts/risk-status-type';

import type { UpdateRiskRequest } from '../../schemas/risks/risk-mutate-request.schema';
import {
  buildScheduleFields,
  type ScheduleDefaults,
} from '../../types/transform';

export interface RiskUpdateDefaults {
  Description: string | null;
  Status: RiskStatusType | null;
  ParentRiskId: string | null;
  schedule: ScheduleDefaults | null | undefined;
}

export function mergeRiskUpdateDefaults(
  item: UpdateRiskRequest,
  existing: RiskUpdateDefaults
): UpdateRiskRequest {
  return {
    ...item,
    ...(item.description === undefined && existing.Description !== undefined
      ? { description: existing.Description }
      : {}),
    ...(item.status === undefined && existing.Status !== undefined
      ? { status: existing.Status }
      : {}),
    ...(item.parentRiskId === undefined && existing.ParentRiskId != null
      ? { parentRiskId: existing.ParentRiskId }
      : {}),
    ...(item.schedule === undefined && existing.schedule != null
      ? { schedule: buildScheduleFields(existing.schedule) }
      : {}),
  };
}
