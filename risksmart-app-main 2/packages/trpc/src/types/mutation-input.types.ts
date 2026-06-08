/**
 * Shared mutation input types for tRPC mutations.
 *
 * Most entities support a standard combination of:
 *   - Owners & contributors (OwnersAndContributorsInput)
 *   - Tags & departments   (also on OwnersAndContributorsInput)
 *   - Schedule             (ScheduleTRPCInput, separate because not all entities have it)
 *
 * ## Pattern for tRPC mutation hooks
 *
 *   import type { OwnersAndContributorsInput, ScheduleTRPCInput } from '@risksmart-app/trpc/src/types';
 *
 *   type InsertFooInput = OwnersAndContributorsInput & ScheduleTRPCInput & {
 *     Title: string;
 *     // … entity-specific fields
 *   };
 *
 * ## Bridging from form/legacy input that uses lowercase `schedule`
 *
 * When the caller passes `schedule` (lowercase) and the tRPC input expects
 * `Schedule` (uppercase), map at the boundary using mapScheduleToTRPC:
 *
 *   import { mapScheduleToTRPC } from '@risksmart-app/trpc/src/types';
 *   const { schedule, ...rest } = variables;
 *   return trpcMutation.insertFoo({ ...rest, ...mapScheduleToTRPC(schedule) });
 */

import type { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import type { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';

/** Schedule fields used by both GraphQL and tRPC input types. */
export interface ScheduleInput {
  Frequency?: TestFrequency | null;
  ManualDueDate?: string | null;
  StartDate?: string | null;
  TimeToCompleteUnit?: UnitOfTime | null;
  TimeToCompleteValue?: number | null;
}

/**
 * Standard owner, contributor, tag, and department relationship arrays.
 * Field names are PascalCase in both the GraphQL and tRPC APIs so no
 * conversion is needed for these.
 */
export interface OwnersAndContributorsInput {
  OwnerUserIds?: string[];
  OwnerGroupIds?: string[];
  ContributorUserIds?: string[];
  ContributorGroupIds?: string[];
  TagTypeIds?: string[];
  DepartmentTypeIds?: string[];
}

/**
 * Schedule field for inputs where the field name follows the database
 * relation naming convention (lowercase `schedule`).
 * Used in public-facing hook inputs; map to ScheduleTRPCInput at the
 * tRPC mutation boundary using mapScheduleToTRPC.
 */
export interface ScheduleRelationInput {
  schedule?: ScheduleInput | null;
}

/**
 * Schedule field for tRPC mutation inputs.
 * Uses uppercase `Schedule` to match the tRPC/events API contract.
 */
export interface ScheduleTRPCInput {
  Schedule?: ScheduleInput | null;
}

/**
 * Maps the `schedule` field (GraphQL lowercase) to `Schedule` (tRPC uppercase).
 * Spread the result when forwarding to the tRPC mutation:
 *
 *   const { schedule, ...rest } = variables;
 *   return trpcMutation.insertFoo({ ...rest, ...mapScheduleToTRPC(schedule) });
 */
export function mapScheduleToTRPC(schedule: ScheduleInput | null | undefined): {
  Schedule: ScheduleInput | null | undefined;
} {
  return { Schedule: schedule };
}
