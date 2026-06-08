import type { ScheduleInput } from '../../generated/graphql';

interface ScheduleFields {
  startDate?: string | null;
  manualDueDate?: string | null;
  frequency?: string | null;
  timeToCompleteValue?: number | null;
  timeToCompleteUnit?: string | null;
}

export const toGraphqlScheduleInput = (
  schedule?: ScheduleFields
): ScheduleInput => ({
  Frequency: (schedule?.frequency ?? null) as ScheduleInput['Frequency'],
  ManualDueDate: schedule?.manualDueDate ?? null,
  StartDate: schedule?.startDate ?? null,
  TimeToCompleteValue: schedule?.timeToCompleteValue ?? null,
  TimeToCompleteUnit: (schedule?.timeToCompleteUnit ??
    null) as ScheduleInput['TimeToCompleteUnit'],
});

export interface ExistingOwnershipData {
  ownerGroupIds: string[];
  contributorUserIds: string[];
  contributorGroupIds: string[];
  tagTypeIds: string[];
  departmentTypeIds: string[];
}

export const defaultGraphqlOwnershipFields = (
  owners: string[],
  existing?: ExistingOwnershipData
) => ({
  OwnerUserIds: owners,
  OwnerGroupIds: existing?.ownerGroupIds ?? [],
  ContributorUserIds: existing?.contributorUserIds ?? [],
  ContributorGroupIds: existing?.contributorGroupIds ?? [],
  TagTypeIds: existing?.tagTypeIds ?? [],
  DepartmentTypeIds: existing?.departmentTypeIds ?? [],
});
