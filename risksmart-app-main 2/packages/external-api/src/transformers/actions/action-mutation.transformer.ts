import type { UpdateActionRequest } from '../../schemas/actions/action-mutate-request.schema';

export interface ActionUpdateDefaults {
  ClosedDate: string | null;
  Description: string | null;
}

export function mergeActionUpdateDefaults(
  item: UpdateActionRequest,
  existing: ActionUpdateDefaults
): UpdateActionRequest {
  return {
    ...item,
    ...(item.closedDate === undefined && existing.ClosedDate !== undefined
      ? { closedDate: existing.ClosedDate }
      : {}),
    ...(item.description === undefined && existing.Description !== undefined
      ? { description: existing.Description }
      : {}),
  };
}
